const puppeteer = require('puppeteer');
const fs = require('fs');
const Prompt = require('prompt-password');
const Input = require('prompt-input');

// const emailIDPromit = new Input({
//     name: 'emailID',
//     message: 'email: '
// });
// const passwordPrompt = new Prompt({
//     type: 'password',
//     message: 'password: ',
//     name: 'password'
// });
// const countsPromit = new Input({
//     name: 'countPerDay',
//     message: 'how many profiles to scrape for email (linkedin allows only 100 per day): '
// });

// emailIDPromit.run().then(emailID => {
//     passwordPrompt.run().then(password => {
//         countsPromit.run().then(countPerDay => {

            let inputData = {
                emailID: 'naseef14@gmail.com',
                password: 'password',
                countPerDay: 20
            }

            let emailID = inputData.emailID;
            let password = inputData.password;
            let countPerDay = inputData.countPerDay;

            (async () => {
                const browser = await puppeteer.launch({headless : true});
                const page = await browser.newPage();
                console.log("starting scraper..");
                await page.goto('https://www.linkedin.com/');
                console.log("visiting linkedin.com");
                await page.waitFor('#login-email');
                
                // logging in
                console.log("logging In");
                await page.waitFor(500)
                await page.type('#login-email' , emailID);
                await page.type('#login-password' , password);
                await page.click('#login-submit');
            
                try {
                    await page.waitFor('.t-16.t-black.t-bold');
                } catch(e) {
                    console.log("wrong password. Please cheack the username and password");
                    await browser.close();
                    return;
                }
            
                let logenInName = await page.evaluate(() => {
                    let welcomeMessage = document.querySelector("div > aside.left-rail > div.left-rail-container > div.profile-rail-card > div.profile-rail-card__actor-meta > a.tap-target").innerText;
                    return welcomeMessage;
                })
                console.log("login successfull");
                await page.waitFor(500)
                console.log(logenInName);
                await page.waitFor(500);
            
                let linksData
                if (fs.existsSync(`./scraper2-data/${emailID}.json`)) {
                    linksData = fs.readFileSync(`./scraper2-data/${emailID}.json`);
                }
                if (linksData) {
            
                } else {
                    console.log("first scrape the profile links with first scraper");
                    await browser.close();
                    return;
                }
            
                linksData = JSON.parse(linksData);
                // console.log(linksData.connectsData.length);
                let count = 0;
                // linksData.connectsData.forEach(link => {
                for (var k=0; k<linksData.connectsData.length; k++) {
                    // console.log(linksData.connectsData[k]);
                    if(!linksData.connectsData[k].email && count<countPerDay) {
                        console.log("link is: "+linksData.connectsData[k].link);
                        count++;
                        await page.goto(`${linksData.connectsData[k].link}detail/contact-info/`);
            
                        await page.waitFor("div.pv-profile-section__section-info");
                        let email = await page.evaluate(() => {
                            if (document.querySelector("div.pv-profile-section__section-info")) {
                                // profiles can have hidden emails. handle that case
                                if (document.querySelector("div.pv-profile-section__section-info") && document.querySelector("div.pv-profile-section__section-info").innerText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g) && document.querySelector("div.pv-profile-section__section-info").innerText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g).length>0) {
                                    return document.querySelector("div.pv-profile-section__section-info").innerText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g)[0]
                                } else {
                                    return 'email is hidden';
                                }
                            }
                        })
                        console.log(email)
                        linksData.connectsData[k].email = email;
                    } else if (count>=countPerDay) {
                        console.log("couts reached")
                        break;
                    }
                }
            
                console.log("writing data")
            
                try {
                    fs.mkdirSync('./scraper2-data');
                } catch(e) {
                    console.log("folder already exist.")
                }
                fs.writeFileSync(`scraper2-data/${emailID}.json`, JSON.stringify(linksData));
                console.log("Scrapped successfully");
                await page.waitFor(2000)
                await browser.close();
            })();
//         })
//     })
// })