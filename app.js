#!/usr/bin/env node
require('dotenv').config()
const { PUSHOVER_TOKEN, PUSHOVER_USER, PRONOTE_URL, PRONOTE_USERNAME, PRONOTE_PASSWORD, SPECIFIC_DATE } = process.env
const { login } = require('@dorian-eydoux/pronote-api')
const { format } = require('fecha')
const { post } = require('axios')

const bold = string => `<b>${string}</b>`
const colorize = (string, color) => `<font color="${color}">${string}</font>`
const capitalize = string => string[0].toUpperCase() + string.slice(1)
const uncapitalize = string => string[0].toLowerCase() + string.slice(1)

const form = new require('form-data')()
	form.append('token', PUSHOVER_TOKEN)
	form.append('user', PUSHOVER_USER)
	form.append('sound', 'pianobar')
	form.append('title', 'Emploi du temps')
	form.append('url_title', 'Plus de détails...')
	form.append('url', 'pronote://')
	form.append('html', '1')

// Demain vous commencez par...
const betterSubjects = {
	'ANGLAIS LVA': { pronoun: "de l'", name: 'anglais' },
	'AP FRANCAIS': { pronoun: "de l'", name: 'AP français' },
	'CAMBRIDGE': { name: 'Cambridge' },
	'DS selon calendrier': { pronoun: 'un ', name: 'DS' },
	'ED.PHYSIQUE & SPORT.': { pronoun: 'du ', name: 'sport' },
	'ENSEIGN.SCIENTIFIQUE': { pronoun: "de l'", name: 'enseignement scientifique' },
	'ESPAGNOL LVB': { pronoun: "de l'", name: 'espagnol' },
	FRANCAIS: { pronoun: 'du ', name: 'français' },
	'HIST.GEO.EN.MOR.CIV.': { pronoun: "de l'", name: 'histoire, géo...' },
	'MATHEMATIQUES SPE': { pronoun: 'la ', name: 'spécialité mathématiques' },
	'NUMERIQUE SC.INFORM. SPE': { pronoun: 'de la ', name: 'NSI' },
	'PHYSIQUE-CHIMIE': { pronoun: 'de la ', name: 'physique-chimie' },
	'PHYSIQUE-CHIMIE SPE': { pronoun: 'la ', name: 'spécialité physique-chimie' },
	'SCIENCES VIE & TERRE': { pronoun: 'de la ', name: 'SVT' },
	'VIE DE CLASSE': { pronoun: 'de la ', name: 'vie de classe' }
};

(async () => {
	const session = await login(PRONOTE_URL, PRONOTE_USERNAME, PRONOTE_PASSWORD)
	console.info(`Logged in as ${session.user.name}`)

	const fullTimetable = (await session.timetable(new Date(SPECIFIC_DATE || Date.now())))
		.filter(({ hasDuplicate, isAway, isCancelled }) => !(hasDuplicate && (isAway || isCancelled))) // Remove duplicates classes
	const timetable = fullTimetable.filter(({ isAway, isCancelled }) => !(isAway || isCancelled)) // Remove cancelled classes

	if (timetable.length) {
		const { subject, from } = timetable[0]
		const { pronoun, name } = betterSubjects[subject]
		const editedTimetable = fullTimetable.filter(({ hasDuplicate, status }) => hasDuplicate || status)

		let message = `Demain vous commencez par ${(pronoun || '') + bold(name || subject)} à ${bold(format(from, 'shortTime')) + (editedTimetable.length ? '\n' : '')}`
		for (const { isAway, isCancelled, subject, status } of editedTimetable) {
			const [ symbol, color ] = isAway || isCancelled ? ['×', '#ff3b30'] : ['↻', '#007aff']
			message += `\n${bold(`${symbol} ${capitalize(betterSubjects[subject].name || subject)}`)}, ${colorize(uncapitalize(status || 'aucun statut'), color)}`
		}

		form.append('message', message)
		console.info(`Sending...\n${message}`)
		await post('https://api.pushover.net/1/messages.json', form, { headers: form.getHeaders() })
		console.info('Message sent!')
	} else console.info(`No class planned tomorrow`)
})()