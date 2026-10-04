# MMM-CoreScope

[CoreScope](https://github.com/Kpa-clawbot/CoreScope) observer activity module for [MagicMirror2](https://magicmirror.builders).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub last commit](https://img.shields.io/github/last-commit/derekn/MMM-CoreScope/master.svg)](https://github.com/derekn/MMM-CoreScope/commits/master)

Displays the [MeshCore](https://meshcore.co.uk) observers and their packets received in the last hour on your MagicMirror pulled from the CoreScope API, along with the time since each observer's last packet. Stale observers are marked with a warning icon and offline observers are hidden by default, using CoreScope's configured health thresholds.

Requires MagicMirror 2.25.0 or later and a reachable CoreScope instance (no API key needed).

### Install

Clone into your MM `modules` folder

```bash
git clone git@github.com:derekn/MMM-CoreScope.git
```

### Configure

Add to "modules" in `config/config.js`

```javascript
{
	module: "MMM-CoreScope",
	header: "MeshCore Observers",
	position: "top_right",
	config: {
		url: "http://corescope_ip:port",
		updateInterval: 60000,
	}
}
```

#### Options

| Config Name | Description | Default Value |
| --- | --- | --- |
| `url` | CoreScope base URL, example: http://localhost:3000 | http://localhost:3000 |
| `updateInterval` | Update interval in milliseconds to poll the API | 60000 |
| `exclude` | Observer names or IDs to hide, example: `["Observer 1", "abc123"]` | [] |
| `hideOffline` | Hide observers CoreScope considers offline (no status within its stale threshold, 24 hours by default) | true |
