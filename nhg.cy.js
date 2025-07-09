
// Dit testplan test de NHG sneltoets applicatie op https://mijn.nhg.nl/
// Focus op scenario met medeaanvrager en financiële verplichtingen

describe('NHG Sneltoets - Hypotheekberekening met Medeaanvrager', () => {
  
  beforeEach(() => {
    // Configureer viewport voor consistente tests
    cy.viewport(1280, 720)
    
    // Navigeer naar de NHG sneltoets applicatie
    cy.visit('https://mijn.nhg.nl/', {
      failOnStatusCode: false // Voorkom dat test faalt bij 4xx/5xx errors
    })
    
    // Wacht tot de pagina geladen is
    cy.get('body', { timeout: 10000 }).should('be.visible')
    
    // Accepteer cookies indien aanwezig
    cy.get('body').then(($body) => {
      const cookieSelectors = [
        '[data-testid="cookie-accept"]',
        '.cookie-accept',
        '#cookie-accept',
        'button[class*="cookie"]',
        'button[id*="cookie"]'
      ]
      
      cookieSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().click({ force: true })
        }
      })
    })
  })


  describe('Basis Functionaliteit Tests', () => {
    
    it('Test invoer en interactie met formulier elementen', () => {
      // Vind alle beschikbare invoervelden
      cy.get('input[type="text"], input[type="number"], input:not([type])').then(($inputs) => {
        if ($inputs.length > 0) {
          // Test eerste invoerveld (waarschijnlijk woningwaarde)
          cy.wrap($inputs[0]).click().clear().type('350000')
          
          // Test tweede invoerveld indien beschikbaar (waarschijnlijk eigeninbreng)
          if ($inputs.length > 1) {
            cy.wrap($inputs[1]).click().clear().type('35000')
          }
          
          // Test derde invoerveld indien beschikbaar (waarschijnlijk inkomen)
          if ($inputs.length > 2) {
            cy.wrap($inputs[2]).click().clear().type('50000')
          }
        }
      })
      
      // Zoek naar checkboxes (mogelijk voor medeaanvrager)
      cy.get('body').then(($body) => {
        if ($body.find('input[type="checkbox"]').length > 0) {
          cy.get('input[type="checkbox"]').first().check({ force: true })
        }
      })
      
      // Zoek naar select elementen
      cy.get('body').then(($body) => {
        if ($body.find('select').length > 0) {
          cy.get('select').first().then(($select) => {
            cy.wrap($select).find('option').then(($options) => {
              if ($options.length > 1) {
                cy.wrap($select).select($options[1].value)
              }
            })
          })
        }
      })
    })
    
    it('Test submit functionaliteit', () => {
      // Vul minimale gegevens in
      cy.get('input[type="text"], input[type="number"], input:not([type])').then(($inputs) => {
        if ($inputs.length > 0) {
          cy.wrap($inputs[0]).clear().type('DL@NHG.NL')
        }
      })
      
      // Zoek naar submit button
      cy.get('body').then(($body) => {
        const buttonSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button:contains("Bereken")',
          'button:contains("berekenen")',
          'button:contains("Calculate")',
          'button:contains("Submit")',
          'button'
        ]
        
        let buttonFound = false
        buttonSelectors.forEach(selector => {
          if ($body.find(selector).length > 0 && !buttonFound) {
            cy.get(selector).first().click({ force: true })
            buttonFound = true
          }
        })
        
        if (!buttonFound) {
          cy.log('Geen submit button gevonden')
        }
      })
      
      // Wacht op mogelijke respons
      cy.wait(3000)
    })
  })

  describe('Scenario: Medeaanvrager met Financiële Verplichtingen', () => {
    
 beforeEach(() => {
    cy.viewport(1900, 950);
    cy.visit('https://mijn.nhg.nl/');
  });

  it('vult formulier in en controleert berekening', () => {
    // Wacht tot de sneltoets zichtbaar is
    cy.contains('NHG Sneltoets').should('be.visible');

    // Check aanwezigheid van belangrijke velden
    cy.contains('Sprake van restschuld').should('be.visible');
    cy.contains('Gewenst leenbedrag').should('be.visible');
    cy.contains('Waarvan in box').should('be.visible');
    cy.contains('Hypotheekrente').should('be.visible');
    cy.contains('Gewenste looptijd').should('be.visible');
    cy.contains('Energielabel').should('be.visible');
    cy.contains('Bruto jaarinkomen').should('be.visible');
    cy.get('#mxui_widget_DataView_0').contains('Bereken').should('be.visible');

    // Gegevens invoeren
    cy.get('input').filter('[type="text"]').eq(0).clear().type('450000'); // Gewenst leenbedrag
    cy.get('input[id*="textBox8"]').clear().type('360'); // Box-bedrag (ID bevat textBox8)

    // Energielabel selecteren
    cy.get('select').first().select('A4plusEPGarantie');

    // Geboortedatum hoofdaanvrager
    cy.get('input[placeholder="dd-mm-yyyy"]').eq(0).type('01-01-2000');

    // Bruto jaarinkomen hoofdaanvrager
    cy.contains('Bruto jaarinkomen').parent().find('input').clear().type('50000');

    // Scroll / blur op veld om validaties te triggeren
    cy.get('.form-control-static').first().click();

    // Sprake van medeaanvrager: Ja
    cy.contains('Sprake van medeaanvrager').parent().find('label').contains('Ja').click();

    // Medeaanvrager gegevens
    cy.get('#mxui_widget_DataView_7 input[placeholder="dd-mm-yyyy"]').clear().type('01-01-2004');
    cy.get('#mxui_widget_DataView_7').contains('Bruto jaarinkomen')
      .parent().find('input').clear().type('30000');

    // Financiële verplichtingen hoofdaanvrager: Ja
    cy.contains('Financiële verplichtingen?').parent().find('label').contains('Ja').click();
    cy.contains('Bedrag maandelijks').type('200');
    cy.contains('Aantal maanden').first().type('13');
    cy.contains('Hoogte maandelijkse').type('25');
    cy.contains('Aantal maanden').type('3');

    // Sprake van medeaanvrager opnieuw wisselen
    cy.contains('Sprake van medeaanvrager').parent().find('label').contains('Nee').click();
    cy.contains('Sprake van medeaanvrager').parent().find('label').contains('Ja').click();

    // Verplichtingen hoofdaanvrager uitzetten
    cy.contains('Financiële verplichtingen?').parent().find('label').contains('Nee').click();

    // Verplichtingen medeaanvrager: Ja
    cy.contains('Financiële verplichtingen medeaanvrager?').parent().find('label').contains('Ja').click();
    cy.contains('Bedrag maandelijks').type('35');
    cy.contains('Aantal maanden').first().type('12');
    

    // Klik op Bereken
    cy.get('#mxui_widget_DataView_0').contains('Bereken').click();

    // Controleer resultaat
    cy.contains('Resultaat').should('be.visible');
    cy.contains('384.996').should('be.visible');
  });
});

  describe('Error Handling en Validatie', () => {
    
    
    it('Test invoer validatie met extreme waarden', () => {
      cy.get('input[type="text"], input[type="number"], input:not([type])').then(($inputs) => {
        if ($inputs.length > 0) {
          // Test met zeer hoog bedrag
          cy.wrap($inputs[0]).clear().type('99999999')
          
          // Test met negatief bedrag
          if ($inputs.length > 1) {
            cy.wrap($inputs[1]).clear().type('-1000')
          }
          
          // Test met ongeldige karakters
          if ($inputs.length > 2) {
            cy.wrap($inputs[2]).clear().type('abc123')
          }
        }
      })
      
      // Probeer te submitten
      cy.get('button, input[type="submit"]').first().click({ force: true })
      cy.wait(3000)
      
      // Controleer op foutmeldingen
      cy.get('body').then(($body) => {
        const text = $body.text().toLowerCase()
        
        if (text.includes('maximum') || text.includes('minimum') || 
            text.includes('ongeldig') || text.includes('incorrect')) {
          cy.log('Validatie voor extreme waarden gedetecteerd')
        }
      })
    })
  })

  describe('Gebruikersinterface en Toegankelijkheid', () => {
    
    it('Test responsiviteit op verschillende schermformaten', () => {
      const viewports = [
        { width: 320, height: 568, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 720, name: 'Desktop' }
      ]
      
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height)
        cy.wait(1000)
        
        // Controleer dat essentiële elementen zichtbaar blijven
        cy.get('input, button').should('be.visible')
        cy.get('body').should('be.visible')
        
        cy.log(`${viewport.name} viewport test geslaagd`)
      })
    })
    

  })

  describe('Performance en Stabiliteit', () => {
    
    it('Test laadtijd van de pagina', () => {
      const startTime = Date.now()
      
      cy.visit('https://mijn.nhg.nl/', { timeout: 15000 })
      cy.get('body').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        cy.log(`Pagina laadtijd: ${loadTime}ms`)
        
        // Verwacht dat pagina binnen 10 seconden laadt
        expect(loadTime).to.be.lessThan(10000)
      })
    })
    
    it('Test stabiliteit bij herhaalde interacties', () => {
      // Herhaal dezelfde actie meerdere keren
      for (let i = 0; i < 3; i++) {
        cy.get('input[type="text"], input[type="number"]').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.wrap($inputs[0]).clear().type(`${300000 + i * 10000}`)
          }
        })
        
        cy.wait(1000)
      }
      
      // Controleer dat de pagina nog steeds responsive is
      cy.get('body').should('be.visible')
      cy.get('input, button').should('be.visible')
    })
  })
})

