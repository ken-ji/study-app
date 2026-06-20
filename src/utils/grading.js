const FULLWIDTH_OFFSET = 0xfee0

function normalize(str) {
  return str
    .trim()
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - FULLWIDTH_OFFSET))
    .replace(/　/g, ' ')
    .trim()
}

function judge(input, answer) {
  return normalize(input) === normalize(answer)
}

export { normalize, judge }
