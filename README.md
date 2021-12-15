# mail-organizer
A mail organizer that utilizes a hey mail inspired approach to organizing mail

## How it works

1. You get a mail from someone the system doesn't recognize yet. The system does nothing yet. It leaves it in the "Inbox" folder. 
  1. The system doesn't check other folders. Not its business.
3. You open the mail organizer, login, and the system asks you what to do. You get to pick one action (based on one of the below reactions)
  1. **Screen out**: Who's this? It's mail from that company I signed up with and they now think it's ok to send me marketing mails isn't it.
  2. **Conversations**: Oh look! Someone I've been actually wanting to hear from and reply to!! 
  3. **Feed**: That's a newsletter I actually did sign up for (but I probably won't have time to read it 😉)
  4. **Paper Trail**: A receipt of sort from a company I did business with (that will in the future spam me from hopefully a different mail address)
4. The system now organizes that mail and any future mail from the sender based on your preferences
5. Your mail is now under control

![organizer](https://user-images.githubusercontent.com/208123/146179322-66e3a0d3-a052-4b6f-9a6b-de4028da57e0.png)

### But really, how does the organizing work?

Based on your preference, mails will be moved to a certain folder. Only mails from senders who have the preference "Conversations" will be left "Unread". All other mails will be marked as "Read" and then moved to their respective folder.

Mails are moved to folders based on the preference for the sender. Eg: If you select Conversations as your preference for `parents@provider.com`, their mail will be moved to the Conversations folder.

Senders marked with the preference of Feed will have their mails sent to... You guessed it! The Feed folder.

That's how it works

### Dive deeper into how the app itself works

There are two components to this app. 

One is the organizer interface itself. It lives in the folder `./webapp`. It organizes mail each time you visit it. It does not organize mail in the background. It's also a bit flaky with gmail due to gmail's connection limits

The second is the worker that lives in the folder `./worker` (surprised? Me too). The worker does organize mail in the background once every 10 minutes. It is NOT flaky with gmail since I wrote this code second and I knew better.

I really should do more to share some code between each folder.

The email preferences themselves are stored in a generated file called `sorted-mail.json`. It kind of looks like this

```json
{"someemail@gmail.com":"c","hello@companyididntwanttohearfrom.com":"o"} 
```

The format is:

`email`: `option` (c for conversations, f for feed, o for screened out, and p for paper trail)

# How do I get setup

Painfully? I haven't really made this system to be used by anyone else just yet but here goes.

1. Download the repo
2. Run `npm install`
  1. Want to use docker? Build the docker files `Dockerfile` and `Dockerfile.worker` for the web app and worker respectively. `TODO: Add a sample command here`
4. Copy `config.sample.json` to `config.prod.json` and edit the details. The file is pretty self explanatory
  1. There are better/other ways to do this. This one was the fastest.
  2. Make sure you setup a strong password for the app itself.
  3. Ideally use an app specific password for your email/password config if your provider supports it. If your provider doesn't support it, I'd be a tiny bit worried if I were you.
6. Run `node webapp/app.js` to run the webapp. And someplace else, run `node/worker.js` to start the worker up.
  1. Alternatively run docker commands like this one `docker run --name mailorg -d -p 3000:3000 -v $(pwd)/config.prod.json:/src/config.prod.json -v $(pwd)/sorted-mail.json:/src/sorted-mail.json mailorg:webapp` for the web app and `docker run --name mailworker -d -v $(pwd)/config.prod.json:/src/config.prod.json -v $(pwd)/sorted-mail.json:/src/sorted-mail.json mailorg:worker`
7. Create the following folders/tags in your mail service (no I don't auto create it yet). Please note the capitalizations are super important. So maybe just copy the text from here.
  1. Conversations
  2. Feed
  3. Paper Trail
  4. Screened out
8. Start using the app!

The first time you open the app, it's going to try and get you to organize all the mail you never organized just yet. So unless you have free time, you shouldn't do that. Instead create another folder called "toorganize" (or whatever you want) and move EVERYTHING in your "Inbox" folder to it. Organize only new mails. For what it's worth, I had about 10,000 mails before organizing and it took me about 50 minutes to organize everything. You can do that too but if you use gmail, only after I fix the bug of the app creating too many connections.
