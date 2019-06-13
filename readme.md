## Scraper 1

- Scraper to scrape serach results on 'people'

How to run

- Open `scraper1.js` and enter `email` and `password` for your linkedIn account and the `searchQuery` at line number 5,6 and 7.
- In line number 8, mention what are the page nummbers you want to scrape from. It can be a singe page (ex: 3), multiple pages (ex: 2,3,4) or it can be a range (ex: 2-4)
- Run `node scraper1.js`. This will take some time depending on how many pages to scrape. Once done, data (name, image link, title, summery) will be saved in `scraper1-data` folder.

## Scraper 2

- Scraper to get email IDs of all the connects. This is done in two parts. scraper2-1 is run first and then scraper2-2 is run then.

#### Scraper 2-1

This scraper will get the profile links of all the connections (of the loggen in account).

How to run

- Open `scraper2-1.js` and enter `email` and `password` for your linkedIn account at line number 4 and 5.
- Run `node scraper2-1.js`. This will save the profile links (and names) in `scraper2-data` folder. If you run this again, It will look for new connections and update the list.

#### Scraper 2-2

For this scraper to run, the first scraper should have been run once.

How to run

- Open `scraper2-2.js` and enter `email` and `password` for your linkedIn account at line number 4 and 5.
- In line number 6, enter the number of profile (`countPerDay`) to scrape for email. (LinkedIn does not allow bulk profile views. This is to avoid that). If you enter 5, scraper will scrape 5 profiles and save the emails in the same file. When you run the scraper agian, it will scrape 5 new profiles and save the emails. i.e, if you run this three times, it would scrape 15 emails (assuming `countPerDay` = 5)
- Run `node scraper2-2.js`. This will update the profile links (and names) in `scraper2-data` folder with the email.