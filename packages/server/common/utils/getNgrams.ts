// prettier-ignore
const dictionary: Record<string, string> = {
  "а": "a",
  "б": "b",
  "в": "v",
  "г": "g",
  "д": "d",
  "е": "e",
  "ж": "zh",
  "з": "z",
  "и": "i",
  "й": "i",
  "к": "k",
  "л": "l",
  "м": "m",
  "н": "n",
  "о": "o",
  "п": "p",
  "р": "r",
  "с": "s",
  "т": "t",
  "у": "u",
  "ф": "f",
  "х": "h",
  "ц": "ts",
  "ч": "ch",
  "ш": "sh",
  "щ": "sch",
  "ъ": "hrd",
  "ы": "i",
  "ь": "sft",
  "э": "e",
  "ю": "yu",
  "я": "ya",
  "ё": "yo"
};

export function getNgrams(text: string, n = 3) {
  const transformedText = text
    .toLowerCase()
    .split("")
    .reduce((acc, char, i, arr) => {
      if (i > 1 && arr[i - 1] === char) {
        return acc;
      } else {
        return acc + (dictionary[char] ?? char);
      }
    }, "");

  return transformedText
    .split(" ")
    .map((word) => {
      const letters = word.split("");

      if (letters.length <= 3) {
        return letters.join("");
      }

      const trigrams: string[] = [];

      for (let i = 0; i < letters.length - n + 1; i++) {
        let ngram = "";

        for (let a = 0; a < n; a++) {
          ngram += letters[i + a];
        }

        trigrams.push(ngram);
      }

      return trigrams;
    })
    .flat()
    .join(" ");
}
