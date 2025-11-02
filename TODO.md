## TASK TODAY

```
01-01-2025
```

#### API

- [X] ADD API KEY GUARD
- [ ] add indicator to say if provider is configured or not
- [ ] test configuration before mark it as valid
- [ ] should not be able to activate a provider if config is not valid
- [ ] add webhook secrets to set in providers dashbord
- [X] remove providers secrets on transations fetch enpoints
- [X] reconsiliate payee user by phone
- [X] not update secret on webhook update if secret not provided
- [X] add webhook description
- [X] add delete my account
- [X] if user try to logout and his acount is deleted , send an error message to say it and user have to contact admin to restor
- [X] fordib account deletion if there isn't at leat one superuser
- [X] not initiate payment if there are no active provider
- [X] payment initialisation : check if project exist and return a explicit error message if not
- [X] wave payment redirect uls
- [X] fix : change provider
- [ ] add a long pooling endpint to check if transation is completed

#### WEB

* [X] check if its first login and propose to change the password
* [X] add admin crud, and change password and email verifications
* [X] add list users
* [X] let only one toast on webhook creation
* [X] add webhook description
* [X] redirect to new project page if not project yet
* [X] coriger les filtre de jours
* [X] correct webhook page overflow
* [X] add NP logo on mobile
* [X] activate/deactiva provider buttons colors
* [X] add paddings to user mangement page

#### INSTALATION

* [ ] persit admin credentials
* [ ] add update script
* [ ] modify the persisted admin credentials if there are any changes
