# Make sure you have jq installed to run this

main() {
grep -r "tx(" src | sed -e "s/^.*tx(//g" | sed -e "s/).*$//g" | sed -e "s/'//g" | sed -e "s/,.*$//g" | sort | uniq -u | while read line ; do
    if [[ $(jq ".$line" ./_locales/en.json) = 'null' && $(jq ".$line" ./_locales/_experimental_en.json) = 'null' ]]; then
      echo "- [ ] $line"
    fi
  done
}

echo "Missing translations:"

main 2>/dev/null | uniq -u

echo "You need to check these by hand:"

grep -r "tx(" src | grep "tx([^']" 
