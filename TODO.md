# TODO: Implement Campaign Stop Redirect

## Tasks
- [ ] Update migrations.sql to use 'Stop' and 'Expire' status values
- [ ] Rename CampaignStopped.jsx to CampaignStop.jsx
- [ ] Rename CampaignStopped.css to CampaignStop.css
- [ ] Update CampaignStop.jsx to display "Link is stopped contact provider for more details"
- [x] Update App.jsx route from "/campaign-stopped" to "/campaign-stop"
- [x] Update App.jsx import from CampaignStopped to CampaignStop
- [ ] Update server.js status checks to "Stop" and "Expire"
- [ ] Update server.js redirect URLs to "/campaign-stop"
- [ ] Update test-status-redirects.js to use 'Stop', 'Expire', and '/campaign-stop'
- [ ] Run migrations to update database
- [ ] Test the functionality
- [x] Hide header and footer on campaign stop page
