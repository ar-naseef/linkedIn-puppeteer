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

// emailIDPromit.run().then(emailID => {
//     passwordPrompt.run().then(password => {

        let inputData = {
            emailID: 'naseef14@gmail.com',
            password: 'password'
        }

        let emailID = inputData.emailID;
        let password = inputData.password;

        async function autoScroll(page){
            await page.evaluate(async () => {
                await new Promise((resolve, reject) => {
                    var totalHeight = 0;
                    var distance = 100;
                    var timer = setInterval(() => {
                        var scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
        
                        if(totalHeight >= scrollHeight){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 500);
                });
            });
        }
        
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
        
            
            if (fs.existsSync(`./scraper2-data/${emailID}.json`)) {
                let linksData = fs.readFileSync(`./scraper2-data/${emailID}.json`);
                linksData = JSON.parse(linksData);
                console.log("account already scraped. now looking for new connects..");
                await page.goto("https://www.linkedin.com/mynetwork/invite-connect/connections/");
            
                await page.waitFor(3000);
            
                console.log("scrolling..");
                await autoScroll(page);
            
                console.log("getting the links");
            
                let linkedinUrls = await page.evaluate((linksData) => {
                    let profileLink = "";
                    let profileName = "";
                    let LinksUL = document.querySelectorAll("div.core-rail > div > div > section > ul > li");
                    for (var i=0; i<LinksUL.length; i++) {
                        console.log(i);
                        if (LinksUL[i].querySelector("div > a")) {
                            profileLink = LinksUL[i].querySelector("div > a").href;
                        }
                        if (LinksUL[i].querySelector("div").children[1].querySelector("a > span.mn-connection-card__name")) {
                            profileName = LinksUL[i].querySelector("div").children[1].querySelector("a > span.mn-connection-card__name").innerText;
                        }
        
                        let isNew = true
                        linksData.connectsData.forEach(connData => {
                            if (connData.link === profileLink) {
                                isNew = false 
                            }
                        });
        
                        if (isNew) {
                            linksData.connectsData.push({
                                link: profileLink,
                                name: profileName
                            })
                        }
                    }
                    return linksData;
                }, linksData)
            
                // console.log("finalPageData ->");
                // console.log(linkedinUrls);
                fs.writeFileSync(`scraper2-data/${emailID}.json`, JSON.stringify(linkedinUrls));
                console.log("Scrapped successfully");
                await page.waitFor(2000)
                await browser.close();
            } else {
                console.log("scraping the links of connections..")
                await page.goto("https://www.linkedin.com/mynetwork/invite-connect/connections/");
            
                await page.waitFor(3000);
            
                console.log("scrolling..");
                await autoScroll(page);
            
                console.log("getting the links");
            
                let linkedinUrls = await page.evaluate(() => {
                    let linksArr = []
                    let profileLink = "";
                    let profileName = "";
                    let LinksUL = document.querySelectorAll("div.core-rail > div > div > section > ul > li");
                    for (var i=0; i<LinksUL.length; i++) {
                        if (LinksUL[i].querySelector("div > a")) {
                            profileLink = LinksUL[i].querySelector("div > a").href;
                        }
                        if (LinksUL[i].querySelector("div").children[1].querySelector("a > span.mn-connection-card__name")) {
                            profileName = LinksUL[i].querySelector("div").children[1].querySelector("a > span.mn-connection-card__name").innerText;
                        }
                        linksArr.push({
                            link: profileLink,
                            name: profileName
                        })
                    }
                    return linksArr;
                })
            
                // console.log("finalPageData ->");
                // console.log(linkedinUrls);
                try {
                    fs.mkdirSync('./scraper2-data');
                } catch(e) {
                    console.log("folder already exist.")
                }
                fs.writeFileSync(`scraper2-data/${emailID}.json`, JSON.stringify({
                    email: emailID,
                    connectsData: linkedinUrls
                }));
                console.log("Scrapped successfully");
                await page.waitFor(2000)
                await browser.close();
            }
        
        })();

//     })
// })

