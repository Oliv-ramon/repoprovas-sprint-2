import "./cypress.js";

import { faker } from "@faker-js/faker";
describe("Sign-up", () => {

  it("should sign-up successfully", () => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    cy.visit("http://localhost:3000/");

    cy.get("input[name=email]").type(user.email);
    cy.get("input[name=password]").type(user.password);
    cy.get("input[name=passwordConfirmation]").type(user.password);
    
    cy.intercept("POST", "http://localhost:5000/sign-up").as("signUp");
    
    cy.contains("Cadastrar").click();

    cy.wait("@signUp");

    cy.contains("Cadastro efetuado com sucesso!");

    cy.url().should("equal", "http://localhost:3000/login");
  });
});