# Naroo-On (Backend)

<p>
2021 New-deal-job Project of Mapo-gu Office<br/>
(Lecture and Video-Link-Management Service)
</p>

### Why devlope this?

> To promote collaborative hands-on experiences

### Using Framework

> Typescript
> Nest.js

### Environment Variables

> This project use dotenv library, and load .env file

| Variable Name        | Description                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                 | Port Number                                                                                                                                    |
| FRONT_URL            | Frontend Web Service URL                                                                                                                       |
| DATABASE_URL         | PostgreSQL Database Access Credentials<br/>(eg. **postgres://[ID]:[PASSWORD]@[HOST]:[PORT]/[DBNAME]**)                                         |
| IS_SYNC              | If 'Y', will be set TypeORM-Force-Sync-Opt to true                                                                                             |
| IS_CREATE_ADMIN      | If 'Y', Admin-Account will be created                                                                                                          |
| EMAIL_FIRST_ADMIN    | Email of Auto-Generated-Admin-Account When sync-mode<br/>(default: admin@test.com)                                                             |
| PASSWORD_FIRST_ADMIN | Password of Auto-Generated-Admin-Account When sync-mode<br/>(default: admin@test.com)                                                          |
| MAILGUN_DOMAIN       | Domain of own service                                                                                                                          |
| MAILGUN_KEY          | Mailgun Service Private Key                                                                                                                    |
| MAILGUN_USER         | Mailgun Service Username                                                                                                                       |
| JWT_SECRET           | Secret Key for Generate JWT Access Token                                                                                                       |
| IS_SAVE_LOGFILE      | If 'Y', logs automatically stored as file in [workspace]/logs directory<br/>You might have to premake dir folder in workspace cuz of permisson |

> **If your devops has alternative logging way, set IS_SAVE_LOGFILE to 'N'**

### Github Repository Link of Front-end Project

> [Link](https://github.com/konerds/naroo-on-frontend)

### ※ This is just for practice, not an actual web service!!!

> [Link](https://naroo-on-frontend.pages.dev)

### Developer, Engineer Manual (in Korean)

> [Link](https://cdn.discordapp.com/attachments/943123016659922977/1059857891256967318/naroo-on-manual-211028.pdf)
