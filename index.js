function setVhUnit() {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }

      setVhUnit()
      window.addEventListener('resize', setVhUnit)
      window.addEventListener('orientationchange', setVhUnit)

      const categories = [
        {
          title: 'Suspects',
          items: ['Green', 'Mustard', 'Orchid', 'Peacock', 'Plum', 'Scarlett'],
        },
        {
          title: 'Weapons',
          items: [
            'Candlestick',
            'Knife',
            'Lead Pipe',
            'Revolver',
            'Rope',
            'Wrench',
          ],
        },
        {
          title: 'Rooms',
          items: [
            'Ballroom',
            'Billiard Room',
            'Conservatory',
            'Dining Room',
            'Hall',
            'Kitchen',
            'Library',
            'Lounge',
            'Study',
          ],
        },
      ]

      let numPlayers = 3,
        maxPlayers = 6,
        minPlayers = 3
      const sheet = document.getElementById('sheet')
      const numPlayersDisplay = document.getElementById('numPlayersDisplay')
      const contextMenu = document.getElementById('contextMenu')
      const menuOptions = [
        '❌',
        '✅',
        '❓',
        '1️⃣',
        '2️⃣',
        '3️⃣',
        '4️⃣',
        '5️⃣',
        '👁️',
        '🗑️',
      ]
      let currentCell = null
      let history = [],
        historyIndex = -1

      const numberIcons = {
        '1️⃣': '<i class="ri-number-1"></i>',
        '2️⃣': '<i class="ri-number-2"></i>',
        '3️⃣': '<i class="ri-number-3"></i>',
        '4️⃣': '<i class="ri-number-4"></i>',
        '5️⃣': '<i class="ri-number-5"></i>',
      }

      menuOptions.forEach((option) => {
        const div = document.createElement('div')
        div.textContent = option
        div.onclick = () => {
          if (!currentCell) return

          let marker = currentCell.querySelector('.marker')
          if (!marker) {
            marker = document.createElement('span')
            marker.classList.add('marker')
            currentCell.appendChild(marker)
          }

          const existingIcon = currentCell.querySelector('.eye-icon')

          if (option === '🗑️') {
            marker.textContent = ''
            const numbers = currentCell.querySelector('.numbers')
            if (numbers) numbers.remove()
            if (existingIcon) existingIcon.remove()
          } else if (option === '👁️') {
            if (existingIcon) existingIcon.remove()
            else {
              const icon = document.createElement('i')
              icon.className = 'ri-eye-line eye-icon'
              currentCell.appendChild(icon)
            }
          } else if (['❌', '✅', '❓'].includes(option)) {
            marker.textContent = option
          } else if (Object.keys(numberIcons).includes(option)) {
            // numbers: toggle inside .numbers container
            let numbers = currentCell.querySelector('.numbers')
            if (!numbers) {
              numbers = document.createElement('div')
              numbers.classList.add('numbers')
              currentCell.appendChild(numbers)
            }
            // toggle specific number icon HTML
            const iconHtml = numberIcons[option]
            if (numbers.innerHTML.includes(iconHtml)) {
              numbers.innerHTML = numbers.innerHTML.replace(iconHtml, '')
            } else {
              numbers.innerHTML += iconHtml
            }
          }

          contextMenu.style.display = 'none'
          updateRowLogic(currentCell.parentElement)
          updateKnownCounters()
          saveState()
        }
        contextMenu.appendChild(div)
      })

      // Show context menu near clicked cell
      sheet.addEventListener('click', (e) => {
        if (!e.target.classList.contains('clickable')) {
          contextMenu.style.display = 'none'
          return
        }
        currentCell = e.target
        const rect = e.target.getBoundingClientRect()
        const tableRect = sheet.getBoundingClientRect()
        contextMenu.style.display = 'flex'
        contextMenu.style.flexWrap = 'wrap'
        contextMenu.style.width = 'auto'

        let left = rect.left + window.scrollX
        let top = rect.bottom + window.scrollY

        // ensure it doesn't go off the right/bottom of table viewport
        if (left + contextMenu.offsetWidth > tableRect.right + window.scrollX)
          left = Math.max(
            rect.right + window.scrollX - contextMenu.offsetWidth,
            tableRect.right + window.scrollX - contextMenu.offsetWidth - 4
          )
        if (top + contextMenu.offsetHeight > tableRect.bottom + window.scrollY)
          top = rect.top + window.scrollY - contextMenu.offsetHeight

        if (left < tableRect.left + window.scrollX)
          left = tableRect.left + window.scrollX + 4
        if (top < tableRect.top + window.scrollY)
          top = tableRect.top + window.scrollY + 4

        contextMenu.style.left = left + 'px'
        contextMenu.style.top = top + 'px'
      })

      document.addEventListener('click', (e) => {
        if (
          !contextMenu.contains(e.target) &&
          !e.target.classList.contains('clickable')
        )
          contextMenu.style.display = 'none'
      })

      // build table
      function rebuildTable(saveHistory = true) {
        sheet.innerHTML = ''
        // header row
        const header = document.createElement('tr')
        header.innerHTML =
          `<th>Card</th>` +
          Array.from(
            { length: numPlayers },
            (_, i) =>
              `<th contenteditable="true" class="editable">P${i + 1}</th>`
          ).join('')
        sheet.appendChild(header)

        // known row
        const knownRow = document.createElement('tr')
        knownRow.id = 'knownCardsRow'
        knownRow.innerHTML =
          `<td>Known</td>` +
          Array.from({ length: numPlayers }, () => `<td>0</td>`).join('')
        sheet.appendChild(knownRow)

        // categories
        categories.forEach((cat) => {
          const catRow = document.createElement('tr')
          catRow.innerHTML = `<th colspan="${numPlayers + 1}">${cat.title}</th>`
          sheet.appendChild(catRow)

          cat.items.forEach((item) => {
            const row = document.createElement('tr')
            const nameCell = document.createElement('td')
            nameCell.textContent = item
            nameCell.dataset.clickState = '0'
            nameCell.style.cursor = 'pointer'
            nameCell.addEventListener('click', () => {
              // cycle name states
              let state = parseInt(nameCell.dataset.clickState || '0', 10)
              nameCell.classList.remove('crossed', 'highlighted')
              nameCell.textContent = nameCell.textContent.replace(/^➡️ /, '')
              state = (state + 1) % 3
              nameCell.dataset.clickState = String(state)
              if (state === 1) nameCell.classList.add('crossed')
              else if (state === 2) {
                nameCell.classList.add('highlighted')
                nameCell.textContent = '➡️ ' + item
              }
              updateRowLogic(row)
              updateKnownCounters()
              saveState()
            })
            row.appendChild(nameCell)

            for (let i = 0; i < numPlayers; i++) {
              const td = document.createElement('td')
              td.className = 'clickable'
              row.appendChild(td)
            }

            sheet.appendChild(row)
          })
        })

        if (saveHistory) saveState()
      }

      // Main row logic using .marker / .eye-icon / .numbers elements
      function updateRowLogic(row) {
        const cells = Array.from(row.querySelectorAll('td.clickable'))
        const nameCell = row.querySelector('td:first-child')

        // detect any ✅ markers
        const hasCheck = cells.some((c) => {
          const m = c.querySelector('.marker')
          return m && m.textContent === '✅'
        })

        if (hasCheck) {
          // auto-fill ❌ in other cells but preserve eye & numbers
          cells.forEach((c) => {
            let m = c.querySelector('.marker')
            if (!m) {
              m = document.createElement('span')
              m.classList.add('marker')
              c.appendChild(m)
            }
            if (m.textContent !== '✅') m.textContent = '❌'
          })
          nameCell.classList.add('crossed')
          nameCell.classList.remove('highlighted')
          nameCell.textContent = nameCell.textContent.replace(/^➡️ /, '')
          return
        }

        // count ❌ markers
        const xCount = cells.filter((c) => {
          const m = c.querySelector('.marker')
          return m && m.textContent === '❌'
        }).length

        if (xCount >= 3) {
          nameCell.classList.add('highlighted')
          nameCell.classList.remove('crossed')
          if (!nameCell.textContent.startsWith('➡️ '))
            nameCell.textContent = '➡️ ' + nameCell.textContent
        } else {
          // respect manual name state if set to crossed/highlight by clicks; otherwise reset
          if (nameCell.dataset.clickState === '0') {
            nameCell.classList.remove('crossed', 'highlighted')
            nameCell.textContent = nameCell.textContent.replace(/^➡️ /, '')
          } else {
            // manual state will be visually handled by the click handler already
            if (nameCell.dataset.clickState === '1') {
              nameCell.classList.add('crossed')
              nameCell.classList.remove('highlighted')
            } else if (nameCell.dataset.clickState === '2') {
              nameCell.classList.add('highlighted')
              nameCell.classList.remove('crossed')
              if (!nameCell.textContent.startsWith('➡️ '))
                nameCell.textContent = '➡️ ' + nameCell.textContent
            }
          }
        }
      }

      function updateKnownCounters() {
        const knownRow = document.getElementById('knownCardsRow')
        for (let i = 0; i < numPlayers; i++) {
          const colIndex = i + 1
          let count = 0
          Array.from(sheet.querySelectorAll('tr')).forEach((row) => {
            const cell = row.children[colIndex]
            const m = cell ? cell.querySelector('.marker') : null
            if (m && m.textContent === '✅') count++
          })
          knownRow.children[colIndex].textContent = count
        }
      }

      // Save snapshot of every td (text + marker + numbers + eye + clickState)
      function saveState() {
        const tds = Array.from(sheet.querySelectorAll('td'))
        const snapshot = tds.map((td) => {
          return {
            text: td.textContent || '',
            marker: td.querySelector('.marker')
              ? td.querySelector('.marker').textContent
              : '',
            numbers: td.querySelector('.numbers')
              ? td.querySelector('.numbers').innerHTML
              : '',
            hasEye: !!td.querySelector('.eye-icon'),
            clickState: td.dataset.clickState || '0',
          }
        })
        history = history.slice(0, historyIndex + 1)
        history.push(snapshot)
        historyIndex++
        updateButtons()
      }

      // Restore snapshot and recompute visuals
      function restoreState(index) {
        if (index < 0 || index >= history.length) return
        const snapshot = history[index]
        const tds = Array.from(sheet.querySelectorAll('td'))
        for (let i = 0; i < tds.length; i++) {
          const td = tds[i]
          const item = snapshot[i] || {
            text: '',
            marker: '',
            numbers: '',
            hasEye: false,
            clickState: '0',
          }
          // clear
          td.innerHTML = ''
          // restore dataset
          td.dataset.clickState = item.clickState || '0'
          // for name cells and known cells (non-clickable), restore text content
          if (!td.classList.contains('clickable')) {
            td.textContent = item.text || ''
          } else {
            // clickable cells: reconstruct marker, eye, numbers (don't put plain text)
            if (item.marker) {
              const marker = document.createElement('span')
              marker.classList.add('marker')
              marker.textContent = item.marker
              td.appendChild(marker)
            }
            if (item.hasEye) {
              const icon = document.createElement('i')
              icon.className = 'ri-eye-line eye-icon'
              td.appendChild(icon)
            }
            if (item.numbers) {
              const numbers = document.createElement('div')
              numbers.classList.add('numbers')
              numbers.innerHTML = item.numbers
              td.appendChild(numbers)
            }
          }
        }
        historyIndex = index
        // recompute rows and counters to reflect restored markers
        recomputeAllRows()
        updateKnownCounters()
        updateButtons()
      }

      function recomputeAllRows() {
        const rows = Array.from(sheet.querySelectorAll('tr'))
        rows.forEach((row) => {
          // skip header row and known row
          if (row.id === 'knownCardsRow') return
          // only rows that actually have clickable tds (card rows)
          if (row.querySelectorAll('td.clickable').length > 0)
            updateRowLogic(row)
        })
      }

      function updateButtons() {
        document.getElementById('undoBtn').disabled = historyIndex <= 0
        document.getElementById('redoBtn').disabled =
          historyIndex >= history.length - 1
      }

      // wire events
      document.getElementById('undoBtn').addEventListener('click', () => {
        if (historyIndex > 0) restoreState(historyIndex - 1)
      })
      document.getElementById('redoBtn').addEventListener('click', () => {
        if (historyIndex < history.length - 1) restoreState(historyIndex + 1)
      })
      document
        .getElementById('increasePlayers')
        .addEventListener('click', () => {
          if (numPlayers < maxPlayers) {
            numPlayers++
            numPlayersDisplay.textContent = numPlayers
            rebuildTable(false)
          }
        })
      document
        .getElementById('decreasePlayers')
        .addEventListener('click', () => {
          if (numPlayers > minPlayers) {
            numPlayers--
            numPlayersDisplay.textContent = numPlayers
            rebuildTable(false)
          }
        })

      // initial build
      rebuildTable()

      window.addEventListener('resize', function () {
        setVhUnit()
        if (contextMenu.style.display === 'flex' && currentCell) {
          const rect = currentCell.getBoundingClientRect()
          const tableRect = sheet.getBoundingClientRect()

          let left = rect.left + window.scrollX
          let top = rect.bottom + window.scrollY

          if (left + contextMenu.offsetWidth > tableRect.right + window.scrollX)
            left = Math.max(
              rect.right + window.scrollX - contextMenu.offsetWidth,
              tableRect.right + window.scrollX - contextMenu.offsetWidth - 4
            )
          if (
            top + contextMenu.offsetHeight >
            tableRect.bottom + window.scrollY
          )
            top = rect.top + window.scrollY - contextMenu.offsetHeight

          if (left < tableRect.left + window.scrollX)
            left = tableRect.left + window.scrollX + 4
          if (top < tableRect.top + window.scrollY)
            top = tableRect.top + window.scrollY + 4

          contextMenu.style.left = left + 'px'
          contextMenu.style.top = top + 'px'
        }
      })