'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
const event = undefined
const context = undefined

describe('Tests Lambda Execution', function () {
    it('Verifies successful response', async () => {
        const result = await app.lambdaHandler(event, context)

        expect(result).to.be.an('object')
        expect(result.statusCode).to.equal(200)
        expect(result.body).to.be.an('string')

        let response = JSON.parse(result.body)

        expect(response).to.be.an('object')
        expect(response.statusCode).to.be.equal(200)
    })
})
