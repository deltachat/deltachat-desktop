const countCalls: { [key: string]: number } = {}
export function countCall(label: string) {
  if (countCalls[label]) {
    countCalls[label]++
  } else {
    countCalls[label] = 1
  }
}
export function printCallCounterResult() {
  console.table(countCalls)
}
