export function select<F extends string>(...select: F[]) {
  const result: { [key: string]: boolean } = {};

  select.forEach((s) => (result[s] = true));

  return result as { [key in F]: boolean };
}

export function toCamelCase(input: string) {
  let wordArr = input.split(/[-_ ]/g);

  if (wordArr.length === 1) {
    if (wordArr[0].match(/^[A-ZА-Я0-9]*$/)) {
      return wordArr[0].toLowerCase();
    } else {
      return wordArr[0][0].toLowerCase() + wordArr[0].slice(1);
    }
  }

  wordArr = wordArr.map(word => {
    word = word.toLowerCase();
    return word[0].toUpperCase() + word.slice(1);
  });
  wordArr[0] = wordArr[0][0].toLowerCase() + wordArr[0].slice(1);
  return wordArr.join("");
}

export function escapeSql(str: string) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  });
}
