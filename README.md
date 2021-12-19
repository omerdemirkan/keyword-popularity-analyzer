## [remindmeaboutbitcoin.com](https://remindmeaboutbitcoin.com)

A service that notifies you when crypto's hype dies down using google trends data.

### How does it work?

Once a week, a scheduled firebase cloud function fetches google trends data for a set of keywords, analyzes the trends to determine if the popularity has dropped significantly, and sends out emails to subscribers if it has.

### Privacy policy

Contributions are welcome through pull-requests, however, there are some ground-rules:

- Emails that are sent must not publically disclose other recipients. With sendgrid's API, this means exclusively sending personalized emails. Avoid using `sendgrid.send()` without adding personalizations.
- In the case of authenticated users, use oauth or hash and salt all passwords. Specify necessary modifications to environmental variables and/or firebase config variables in pull-requests.
- To deter bruteforce attempts to see if other emails are subscribed, don't differentiate behavior between matching and non-matching emails.

### Consider supporting!

[remindmeaboutbitcoin.com](https://remindmeaboutbitcoin.com) is currently a passion project. To help keep it working and free, consider supporting me [here](https://www.buymeacoffee.com/omerdemirkan).
