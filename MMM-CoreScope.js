Module.register('MMM-CoreScope', {
	requiresVersion: '2.25.0',
	defaults: {
		url: 'http://localhost:3000',
		updateInterval: 60 * 1000,
		exclude: [],
		hideOffline: true
	},

	getStyles() {
		return ['MMM-CoreScope.css']
	},

	start() {
		this.sendSocketNotification('INIT', this.config)
	},

	socketNotificationReceived(notification, payload) {
		if (notification !== 'SET_DATA') return
		this.payload = payload
		this.updateDom()
	},

	getDom() {
		const wrapper = document.createElement('div')
		wrapper.className = 'small'
		const { observers, error } = this.payload ?? {}
		if (!observers) {
			wrapper.classList.add(...(error ? ['error'] : ['loading', 'dimmed']))
			wrapper.textContent = error ? `CoreScope error: ${error}` : this.translate('LOADING')
			return wrapper
		}
		if (!observers.length) {
			wrapper.classList.add('no-activity', 'dimmed')
			wrapper.textContent = 'no observers'
			return wrapper
		}
		const table = wrapper.appendChild(document.createElement('table'))
		for (const { id, name, status, packetsLastHour, last_packet_at } of observers) {
			const row = table.insertRow()
			const label = row.insertCell()
			label.textContent = name || id
			if (status === 'stale') {
				label.insertAdjacentHTML('beforeend', ' <i class="fa-solid fa-triangle-exclamation" title="Stale"></i>')
			}
			const count = row.insertCell()
			count.className = 'align-right bright'
			count.textContent = `${packetsLastHour}/h`
			const last = row.insertCell()
			last.className = 'align-right dimmed'
			last.textContent = last_packet_at ? this.ago(last_packet_at) : 'never'
		}
		return wrapper
	},

	ago(ts) {
		const s = Math.max(0, Math.round((Date.now() - new Date(ts)) / 1000))
		if (s < 60) return `${s}s ago`
		if (s < 3600) return `${Math.floor(s / 60)}m ago`
		if (s < 86400) return `${Math.floor(s / 3600)}h ago`
		return `${Math.floor(s / 86400)}d ago`
	}
})
