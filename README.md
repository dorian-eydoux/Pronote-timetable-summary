# Pronote timetable summary
Receive a summary of your timetable using Pushover
## Requirements
### Depandencies
Install depandencies using npm
```
npm i
```
### Environment variables
These environment variables are required `PUSHOVER_TOKEN`, `PUSHOVER_USER`, `PRONOTE_URL`, `PRONOTE_USERNAME`, `PRONOTE_PASSWORD`.
You can get your Pushover user key by logging on [Pushover.net](https://pushover.net) then creates your Pushover application on this [link](https://pushover.net/apps/build) to obtain an application token

For testing you can specify a date with `SPECIFIC_DATE` environment variable
#### Example
```
PUSHOVER_TOKEN=abc123
PUSHOVER_USER=abc123
PRONOTE_URL=https://demo.index-education.net/pronote/
PRONOTE_USERNAME=user
PRONOTE_PASSWORD=P@ssw0rd
SPECIFIC_DATE=2021-09-01
```