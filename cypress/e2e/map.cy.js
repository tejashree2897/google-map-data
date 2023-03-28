import 'cypress-wait-until';
let xlsx = require("json-as-xlsx")
describe('Collect google map data', () => {
    it('Add data in excel sheet', () => {
        var all_doctors_map_data = []
        cy.visit('https://www.google.com/maps').wait(1000)
        cy.get('#searchboxinput').type('Cardiologist, bibvewadi').wait(2000)
        cy.get('#searchbox-searchbutton').click().wait(3000)
        cy.waitUntil(() => {
            if (!Cypress.$('#pane +div [data-js-log-root] div[jstcache]  > p > span > span:nth-child(1) ').length) {
                cy.get('#pane +div [data-js-log-root] div[jstcache]  div[aria-label^="Results for "]').then((list) => {
                    cy.wrap(list).scrollTo('bottom').wait(1000)
                })
                return false
            } else {
                return true
            }
        })
        cy.get('#pane +div [data-js-log-root] div[jstcache] > a[href^="https://www.google.com"]').each(($el, index) => {
            // console.log($el, index)
            cy.wrap($el).click({ force: true }).wait(2000)
            var doctors_map_data = {
                'title': '#pane +div [data-js-log-root] div[jstcache] > h1 > span:nth-child(1)',
                'catagory': '#pane +div [data-js-log-root] div[jstcache]  button[jsaction="pane.rating.category"]',
                'reviews': '#pane +div [data-js-log-root] div[jstcache]  div[jsaction="pane.rating.moreReviews"] span[aria-hidden="true"]',
                'address': '#pane +div [data-js-log-root] div[jstcache]  button[aria-label^="Address:"]',
                'website': '#pane +div [data-js-log-root] div[jstcache]  a[aria-label^="Website:"]',
                'phone': '#pane +div [data-js-log-root] div[jstcache]  button[aria-label^="Phone:"]',
                'areacode': '#pane +div [data-js-log-root] div[jstcache]  button[aria-label^="Plus code:"]'
            }
            cy.get(doctors_map_data['title']).then((key) => {
                let map_fetched_data = {}
                Object.entries(doctors_map_data).forEach(([key, value]) => {
                    if (Cypress.$(value).length > 0) {
                        map_fetched_data[key] = Cypress.$(value).text().trim()
                    } else {
                        cy.log('Sorry data for ' + key + ' not found')
                    }

                })
                all_doctors_map_data.push(map_fetched_data)
                // console.log(all_doctors_map_data)
            })

        }).wait(1000).then(() => {
            cy.writeFile('./cypress/fixtures/doctors_map_data.json', all_doctors_map_data)
            let doctors_data = [{
                sheet: "Cardiologist Dhule",
                columns: [
                    { label: "Title", value: "title" },
                    { label: "Catagory", value: "catagory" },
                    { label: "Reviews", value: "reviews" },
                    { label: "Address", value: "address" },
                    { label: "Website", value: "website" },
                    { label: "Phone", value: "phone" },
                    { label: "Areacode", value: "areacode" },

                ],
                content: all_doctors_map_data,
            }]
            let excel_settings = {
                fileName: "Cardiologist Dhule",
                extraLength: 3,
                writeMode: 'writeFile',
                writeOptions: {},
            }
            xlsx(doctors_data, excel_settings)
        })
    })
})