describe('NHG Sneltoets test', () => {
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
