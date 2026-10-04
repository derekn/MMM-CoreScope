const NodeHelper = require('node_helper')
const Log = require('logger')

// Fetch server-side to avoid CORS; one poller shared by all clients
module.exports = NodeHelper.create({
	async getJson(path) {
		const res = await fetch(new URL(path, this.config.url), { signal: AbortSignal.timeout(10_000) })
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		return res.json()
	},

	async poll() {
		try {
			// Fetched once; retried on the next poll if it fails
			this.thresholds ??= (await this.getJson('/api/config/client')).healthThresholds ?? {}
			const { observers } = await this.getJson('/api/observers')
			if (!Array.isArray(observers)) throw new Error('unexpected response')
			const { observerOnlineMs = 3_600_000, observerStaleMs = 86_400_000 } = this.thresholds
			// Mirrors CoreScope's observer healthStatus(), including its 30s clock skew tolerance
			const status = (lastSeen) => {
				const ago = Date.now() - new Date(lastSeen) - 30_000
				if (ago < observerOnlineMs) return 'online'
				return ago < observerStaleMs ? 'stale' : 'offline'
			}
			const { exclude, hideOffline } = this.config
			this.data = {
				observers: observers
					.filter(({ id, name }) => !exclude.includes(id) && !exclude.includes(name))
					.map(({ id, name, packetsLastHour, last_packet_at, last_seen }) => ({
						id,
						name,
						packetsLastHour,
						last_packet_at,
						status: status(last_seen)
					}))
					.filter((o) => !hideOffline || o.status !== 'offline')
					.sort((a, b) => b.packetsLastHour - a.packetsLastHour)
			}
		} catch (err) {
			Log.error(`${this.name}: ${err.message}`)
			this.data = { error: err.message }
		}
		this.sendSocketNotification('SET_DATA', this.data)
		setTimeout(() => this.poll(), this.config.updateInterval)
	},

	socketNotificationReceived(notification, config) {
		if (notification !== 'INIT') return
		if (!this.config) {
			this.config = config
			this.poll()
		} else if (this.data) {
			this.sendSocketNotification('SET_DATA', this.data)
		}
	}
})
