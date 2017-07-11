import utils from "./utils.js"

const utilBinding = (() => {
  try {
    return process.binding("util")
  } catch (e) {}
  return Object.create(null)
})()

const errorCaptureStackTrace = Error.captureStackTrace
const errorMessageRegExp = /^(.+?: .+?) \((\d+):(\d+)\)(?:.*?: (.+))?$/
const lineNumRegExp = /:(\d+)/
const columnNumRegExp = /(\d+)(?=\)|$)/
const filePathRegExp = /(?:^ {4}at |\()(.*?)(?=:\d+:\d+\)?$)/
const splice = Array.prototype.splice

const internalDecorateErrorStack = utilBinding.decorateErrorStack
const internalSetHiddenValue = utilBinding.setHiddenValue

const useInternalDecorateErrorStack = typeof internalDecorateErrorStack === "function"
const useInternalSetHiddenValue = typeof internalSetHiddenValue === "function"

class ErrorUtils {
  static captureStackTrace(error, beforeFunc) {
    errorCaptureStackTrace(error, beforeFunc)
    return error
  }

  static maskStackTrace(error, sourceCode, compiledCode) {
    let trapSet = false

    // For efficiency V8 stack traces are not formatted when they are captured
    // but on demand, the first time the error.stack property is accessed. To
    // avoid accessing the stack property early, and to defer any file read
    // operations, we follow suit and wrap the error object in a proxy object
    // to mask error.stack on first access.
    return new Proxy(error, {
      get(error, key) {
        if (key === "stack" && ! trapSet) {
          sourceCode = typeof sourceCode === "function" ? sourceCode() : sourceCode
          trapSet = true

          decorateStackTrace(error)
          return error.stack = utils.isParseError(error)
            ? maskParserStack(error.stack, sourceCode)
            : maskStack(error.stack, sourceCode, compiledCode)
        }
        return error[key]
      }
    })
  }
}

function decorateStackTrace(error) {
  if (useInternalSetHiddenValue) {
    if ("arrow_message_private_symbol" in utilBinding) {
      internalSetHiddenValue(error, utilBinding.arrow_message_private_symbol, "")
    } else {
      try {
        internalSetHiddenValue(error, "arrowMessage", "")
        internalSetHiddenValue(error, "node:arrowMessage", "")
      } catch (e) {}
    }

    if ("decorated_private_symbol" in utilBinding) {
      internalSetHiddenValue(error, utilBinding.decorated_private_symbol, true)
    } else {
      try {
        internalSetHiddenValue(error, "node:decorated", true)
      } catch (e) {}
    }
  }

  if (useInternalDecorateErrorStack) {
    internalDecorateErrorStack(error)
  }

  return error
}

// Fill in an incomplete stack from:
// SyntaxError: <description>
//     at <function name> (path/to/file.js:<line>:<column>)
//   ...
// to:
// path/to/file.js:<line>
// <line of code, from the compiled code, where the error occurred>
// <column indicator arrow>
//
// SyntaxError: <description>
//     at <function name> (<function location>)
//   ...
function fillStackLines(stackLines, sourceCode, compiledCode) {
  const stackFrame = stackLines[1]
  const locMatch = lineNumRegExp.exec(stackFrame)

  if (locMatch === null) {
    return
  }

  const column = +columnNumRegExp.exec(stackFrame)[1]
  const filePath = filePathRegExp.exec(stackFrame)[1]
  const lineNum = +locMatch[1]

  stackLines.unshift(
    filePath + ":" + lineNum,
    compiledCode.split("\n")[lineNum - 1],
    " ".repeat(column) + "^", ""
  )
}

// Transform parser stack lines from:
// SyntaxError: <description> (<line>:<column>) while processing file: path/to/file.js
//   ...
// to:
// path/to/file.js:<line>
// <line of code, from the original source, where the error occurred>
// <column indicator arrow>
//
// SyntaxError: <description>
//   ...
function maskParserStack(stack, sourceCode) {
  stack = scrubStack(stack)
  const stackLines = stack.split("\n")

  const parts = errorMessageRegExp.exec(stackLines[0]) || []
  const desc = parts[1]
  const lineNum = parts[2]
  const column = parts[3]
  const filePath = parts[4]
  const spliceArgs = [0, 1]

  if (filePath !== void 0) {
    spliceArgs.push(filePath + ":" + lineNum)
  }

  spliceArgs.push(
    sourceCode.split("\n")[lineNum - 1],
    " ".repeat(column) + "^",
    "", desc
  )

  splice.apply(stackLines, spliceArgs)
  return stackLines.join("\n")
}

function maskStack(stack, sourceCode, compiledCode) {
  stack = scrubStack(stack)
  const stackLines = stack.split("\n")

  if (! lineNumRegExp.test(stackLines[0]) &&
      compiledCode !== void 0) {
    fillStackLines(stackLines, sourceCode, compiledCode)
  }

  maskStackLines(stackLines, sourceCode)
  return stackLines.join("\n")
}

function maskStackLines(stackLines, sourceCode) {
  const locMatch = lineNumRegExp.exec(stackLines[0])

  if (locMatch === null) {
    return
  }

  const lineNum = +locMatch[1]
  const column = stackLines[2].indexOf("^")

  const lines = sourceCode.split("\n")
  const sourceLineOfCode = lines[lineNum - 1]
  const stackLineOfCode = stackLines[1]

  let clipLength = 6
  let newColumn = -1

  stackLines[1] = sourceLineOfCode

  // Move the column indicator arrow to the left by matching a clip of
  // code from the stack to the source. To avoid false matches, we start
  // with a larger clip length and work our way down.
  while (clipLength-- > 1 && newColumn < 0) {
    const clip = stackLineOfCode.substr(column, clipLength)
    clipLength = Math.min(clipLength, clip.length)

    let index = column + 1
    while ((index = sourceLineOfCode.lastIndexOf(clip, index - 1)) > -1) {
      newColumn = index
    }
  }

  if (newColumn < 0) {
    stackLines.splice(2, 1)
  } else if (newColumn < column) {
    stackLines[2] = " ".repeat(newColumn) + "^"
    stackLines[5] = stackLines[5].replace(columnNumRegExp, newColumn)
  }

  if (stackLines[0].startsWith("repl:")) {
    stackLines.shift()
  }
}

function scrubStack(stack) {
  return stack
    .split("\n")
    .filter((line) => ! line.includes(__non_webpack_filename__))
    .join("\n")
}

Object.setPrototypeOf(ErrorUtils.prototype, null)

export default ErrorUtils
