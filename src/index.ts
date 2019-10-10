import { PathLike, readFileSync } from "fs"

namespace Gedcom {
  export function parse(path: PathLike) {
    const file = readFileSync(path)
    return parseFile(file.toString().trim())
  }

  function parseFile(file: String) {
    const records = []

    var lastRow: Row = formatLine("-1 TOP")
    file.split("\n").forEach((line) => {
      let row: Row = formatLine(line)
      lastRow = parseRow(row, lastRow, records)
    })

    return records
  }

  function formatLine(line: String): Row {
    var split = line.trim().split(' '),
      level = parseInt(split.shift()),
      tag = split.shift(),
      pointer = null,
      value = null;

    if (tag.startsWith("@")) {
      pointer = tag;
      tag = split.shift()
    }

    if (split.length > 0) {
      value = split.join(" ")
    }

    return new Row(level, pointer, tag, value);
  }

  function parseRow(row: Row, lastRow: Row, records: any[]) {
    // find the parent row of the current row
    var parentRow = lastRow
    while (row.level <= parentRow.level) {
      parentRow = parentRow.parent
    }

    var parentElement = parentRow.element
    if (!parentElement) {
      parentElement = { TYPE: row.tag }
      records.push(parentElement);
    } else {
      if (row.level > 1 && row.level > lastRow.level) {
        parentElement[lastRow.tag] = {}
        parentElement = parentElement[lastRow.tag]
        if (lastRow.value) parentElement["VALUE"] = lastRow.value
      }
      parentElement[row.tag] = row.value;
    }

    row.parent = parentRow
    row.element = parentElement
    return row
  }

  class Row {
    public parent: Row
    public element: any

    constructor(
      readonly level: number,
      readonly pointer: string,
      readonly tag: string,
      readonly value: string
    ) { }
  }
}

export = Gedcom
