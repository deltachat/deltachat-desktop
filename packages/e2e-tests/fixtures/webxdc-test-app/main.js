document.getElementById('self-name').textContent = window.webxdc.selfName

let sent = 0
document.getElementById('send-update').addEventListener('click', () => {
  sent++
  window.webxdc.sendUpdate(
    {
      payload: { text: `update ${sent} from ${window.webxdc.selfName}` },
      summary: `${sent} updates sent`,
    },
    ''
  )
})

window.webxdc.setUpdateListener(update => {
  const li = document.createElement('li')
  li.textContent = update.payload.text
  document.getElementById('updates').append(li)
}, 0)
