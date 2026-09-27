
# Final Frontend Build Notes

This build combines the working PrayasAI Disha frontend with the newer frontend fixes and the selected internship dataset.

## Included
- Indian visual identity using navy, saffron, India green and warm white.
- Login/register flow with password visibility.
- Created accounts persist in browser localStorage and can be logged in again.
- Dashboard, internships, internship details, recommendations, recommendation details, mentorship and profile.
- Skill Gap remains visible in the authenticated navbar.
- Skill Gap page provides resume upload and browser-side PDF/DOCX/TXT analysis.
- Resume analysis shows detected skills, skills to improve, proficiency levels and learning areas.
- Internship listings are loaded from `src/data/internships.js`, generated from `data/internships_master.csv`.
- Internship detail Apply buttons open the corresponding Internshala `source_url`.
- Old PM Internship Scheme demo internship data and PM internship URLs have been removed.

## Frontend-only note
Resume analysis is intentionally browser-side. Internship data is bundled from the supplied CSV so the UI works without a backend. The existing service boundary can later be replaced with a FastAPI endpoint.

## Fresh test
If an older local session causes unexpected login behavior, clear these localStorage keys for the app origin:
- `prayasai_user`
- `prayasai_token`
- `prayasai_accounts`
- `prayasai_profile_data_*`
- `prayasai_resume_*`

Then create a fresh account and log in again.

A production application should not store passwords in localStorage; the current account persistence is only for this frontend/mock phase.
