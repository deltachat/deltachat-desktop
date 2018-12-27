const l = require('./src/localize')
const english = l.getLocaleMessages('en')
const t = l.translate(english)

console.log(t('systemmsg_group_name_changed', ['test', 'asd']))
