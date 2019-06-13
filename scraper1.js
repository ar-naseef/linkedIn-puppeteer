const puppeteer = require('puppeteer');
const _ = require('lodash');
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
// const searchQueryPrompt = new Input({
//     message: 'search query: ',
//     name: 'searchQuery'
// });
// const pages = new Input({
//     message: 'page numbers (3 or 3-5 or 3,4,5) : ',
//     name: 'pageNum'
// });

// emailIDPromit.run().then(emailID => {
//     passwordPrompt.run().then(password => {
//         searchQueryPrompt.run().then(searchQuery => {
//             pages.run().then(pageNum => {
                // console.log(emailID, password, searchQuery, pageNum);

                const inputData = {
                    emailID: 'naseef14@gmail.com',
                    password: 'password',
                    searchQuery: 'project manager',
                    pageNum: 2
                }

                let pageNum = inputData.pageNum;
                if (pageNum.includes("-")) {
                    let start = Number(pageNum.split('-')[0].trim());
                    let end = Number(pageNum.split('-')[1].trim());
                    pageNum = _.range(start, end+1);
                    // console.log(pageNum);
                } else {
                    pageNum = pageNum.split(",");
                }
                
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
                            }, 400);
                        });
                    });
                }
                
                (async () => {
                    const browser = await puppeteer.launch({headless: true});
                    const page = await browser.newPage();
                    console.log("starting scraper..");
                    await page.goto('https://www.linkedin.com/');
                    console.log("visiting linkedin.com");
                    await page.waitFor('#login-email');
                    
                    // logging in
                    console.log("logging In");
                    await page.waitFor(500)
                    await page.type('#login-email' , inputData.emailID);
                    await page.type('#login-password' , inputData.password);
                    await page.click('#login-submit');
                
                    try {
                        await page.waitFor('.t-16.t-black.t-bold');
                    } catch(e) {
                        console.log("wrong password. Please cheack the username and password");
                        await browser.close();
                        return;
                    }
                
                    let logenInName = await page.evaluate(() => {
                        let welcomeMessage = 'welcome';
                        if (document.querySelector("div > aside.left-rail > div.left-rail-container > div.profile-rail-card > div.profile-rail-card__actor-meta > a.tap-target")) {
                            welcomeMessage = document.querySelector("div > aside.left-rail > div.left-rail-container > div.profile-rail-card > div.profile-rail-card__actor-meta > a.tap-target").innerText;
                        }
                        return welcomeMessage;
                    })
                
                    let finalPageData = [];
                    console.log("login successfull");
                    await page.waitFor(500)
                    console.log(logenInName);
                    await page.waitFor(500);
                    console.log(`searching for <${inputData.searchQuery}>`);
                    
                    for (var j=0; j<pageNum.length; j++) {
                        await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${inputData.searchQuery}&page=${pageNum[j]}`)
                        await page.waitFor('.search-results__total');
                
                        await page.waitFor(500)
                        console.log(`scrolling page ${pageNum[j]}..`);
                        await autoScroll(page);
                        await page.waitFor(1000);
                
                        // get data from page
                        let pagedata = await page.evaluate(() => {
                            let peopleLI = document.querySelectorAll("li.search-result");
                            let pageData = [];
                            console.log(peopleLI);
                            for (var i=0; i<peopleLI.length; i++) {
                                // console.log(peopleLI[i].querySelector("div > div > div > a > figure > div > div > div > img").src);
                                let tempObj = {};
                
                                if (peopleLI[i].querySelector("div > div > div > a > figure > div > div > div > img")) {
                                    tempObj.imgUrl = peopleLI[i].querySelector("div > div > div > a > figure > div > div > div > img").src
                                }
                
                                if (peopleLI[i].querySelector("div > div").children[1].querySelector("a > h3 > span > span > span")) {
                                    tempObj.name = peopleLI[i].querySelector("div > div").children[1].querySelector("a > h3 > span > span > span").innerText
                                } else {
                                    tempObj.name = "No name available"
                                }
                
                                if (peopleLI[i].querySelector("div > div").children[1].querySelector("p > span")) {
                                    tempObj.title = peopleLI[i].querySelector("div > div").children[1].querySelector("p > span").innerText
                                } else {
                                    tempObj.title = "no title available"
                                }
                
                                if (peopleLI[i].querySelector("div > div").children[1].querySelectorAll("p")[2]) {
                                    tempObj.summery = peopleLI[i].querySelector("div > div").children[1].querySelectorAll("p")[2].innerText
                                } else {
                                    tempObj.summery = "no summery available"
                                }
                
                                pageData.push(tempObj);
                            }
                            return pageData;
                        })
                        finalPageData.push(...pagedata);
                    }
                
                    // console.log("finalPageData ->");
                    // console.log(finalPageData);
                    let finalData = {
                        searchQuery: inputData.searchQuery,
                        emailID: inputData.emailID,
                        pages: inputData.pageNum,
                        data: finalPageData
                    }
                    try {
                        fs.mkdirSync('./scraper1-data');
                    } catch(e) {
                        console.log("folder already exist.")
                    }
                    fs.writeFileSync(`scraper1-data/${Date.now()}.json`, JSON.stringify(finalData));
                    console.log("Scrapped successfully");
                    await page.waitFor(2000)
                    await browser.close();
                })();
//             })
//         })
//     })
// })