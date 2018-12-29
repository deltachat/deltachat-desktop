#!/bin/bash
function main() {
  grep -r "tx(" src | sed -e "s/^.*tx(//g" | sed -e "s/).*$//g" | sed -e "s/'//g" | sed -e "s/,.*$//g" | sort | uniq -u | while read line ; do
    if [[ $(jq ".$line" ./_locales/en.json) = 'null' && $(jq ".$line" ./_locales/_experimental_en.json) = 'null' ]]; then
      echo $line
    fi
  done
  grep -r "i18n(" conversations | sed -e "s/^.*i18n(//g" | sed -e "s/).*$//g" | sed -e "s/'//g" | sed -e "s/,.*$//g" | sort | uniq -u | while read line ; do
    if [[ $(jq ".$line" ./_locales/en.json) = 'null' && $(jq ".$line" ./_locales/_experimental_en.json) = 'null' ]]; then
      echo $line
    fi
  done
}

main  | uniq -u
