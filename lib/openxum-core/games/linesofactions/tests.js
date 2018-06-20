QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
});

//TEST DU REMPLISSAGE DE LA GRILLE
QUnit.test('extremités non occupées', function(assert) {
    let e = new window.OpenXum.LinesOfActions.Engine();
    assert.ok(typeof e._board[0][0] === "undefined", "case extremité vide");
    assert.ok(typeof e._board[0][7] === "undefined", "case extremité vide");
    assert.ok(typeof e._board[7][0] === "undefined", "case extremité vide");
    assert.ok(typeof e._board[7][7] === "undefined", "case extremité vide");
});

QUnit.test('pions blancs bien placés', function(assert) {
    let e = new window.OpenXum.LinesOfActions.Engine();
    assert.equal(e._board[0][1].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[0][2].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[0][3].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[0][4].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[0][5].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[0][6].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[7][1].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[7][2].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[7][3].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[7][4].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[7][5].color(), 1, "pion blanc bien placé");
    assert.equal(e._board[7][6].color(), 1, "pion blanc bien placé");
});

QUnit.test('pions noirs bien placés', function(assert) {
    let e = new window.OpenXum.LinesOfActions.Engine();
    assert.equal(e._board[1][0].color(), 0, "pion noir bien placé");
    assert.equal(e._board[2][0].color(), 0, "pion noir bien placé");
    assert.equal(e._board[3][0].color(), 0, "pion noir bien placé");
    assert.equal(e._board[4][0].color(), 0, "pion noir bien placé");
    assert.equal(e._board[5][0].color(), 0, "pion noir bien placé");
    assert.equal(e._board[6][0].color(), 0, "pion noir bien placé");

    assert.equal(e._board[1][7].color(), 0, "pion noir bien placé");
    assert.equal(e._board[2][7].color(), 0, "pion noir bien placé");
    assert.equal(e._board[3][7].color(), 0, "pion noir bien placé");
    assert.equal(e._board[4][7].color(), 0, "pion noir bien placé");
    assert.equal(e._board[5][7].color(), 0, "pion noir bien placé");
    assert.equal(e._board[6][7].color(), 0, "pion noir bien placé");


});