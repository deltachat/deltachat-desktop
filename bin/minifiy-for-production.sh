cd node_modules
find ./ -type f -name *.ts -exec rm "{}" \;
find ./ -type f -name *.h -exec rm "{}" \;
find ./ -type f -name *.c -exec rm "{}" \;
find ./ -type f -name *.map -exec rm "{}" \;
find ./ -type f -name *.md -exec rm "{}" \;
find ./ -type f -name *.js.flow -exec rm "{}" \;
find ./ -type d -name "test" -exec rm -rf "{}" \;
find ./ -type f -name "LICENSE" -exec rm "{}" \;
