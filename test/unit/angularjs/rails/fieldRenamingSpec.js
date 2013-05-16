describe("field renaming", function () {
    'use strict';

    beforeEach(module('rails'));

    var q, rootScope,
        transformer, interceptor;

    function testTransform(underscoreData, camelizeData) {
        var result, resultPromise,
            deferred = q.defer();

        expect(transformer(angular.copy(camelizeData, {}))).toEqualData(underscoreData);
        expect(resultPromise = interceptor(deferred.promise)).toBeDefined();

        resultPromise.then(function (response) {
            result = response;
        });

        deferred.resolve(angular.copy(underscoreData, {}));
        rootScope.$digest(); // needed for $q to actually run callbacks
        expect(result).toEqualData(camelizeData);
    }

    beforeEach(inject(function ($rootScope, $q, railsFieldRenamingTransformer, railsFieldRenamingInterceptor) {
        q = $q;
        rootScope = $rootScope;
        transformer = railsFieldRenamingTransformer;
        interceptor = railsFieldRenamingInterceptor;
    }));

    it('should ignore empty response', function() {
        testTransform({}, {});
    });

    it('should ignore null response data', function() {
        testTransform({data: null}, {data: null});
    });

    it('should leave non-data response fields untouched', function() {
        testTransform({data: null, test_value: 'xyz'}, {data: null, test_value: 'xyz'});
    });

    it('should transform abc_def <-> abcDef', function() {
        testTransform({data: {abc_def: 'xyz'}}, {data: {abcDef: 'xyz'}});
    });

    it('should transform abc_def, ghi_jkl <-> abcDef, ghiJkl', function() {
        testTransform({data: {abc_def: 'xyz', ghi_jkl: 'abc'}}, {data: {abcDef: 'xyz', ghiJkl: 'abc'}});
    });

    it('should transform abc_1_def <-> abc1Def', function() {
        testTransform({data: {abc_1_def: 'xyz'}}, {data: {abc1Def: 'xyz'}});
    });

    it('should transform abc <-> abc', function() {
        testTransform({data: {abc: 'xyz'}}, {data: {abc: 'xyz'}});
    });

    it('should transform _abc <-> _abc', function() {
        testTransform({data: {_abc: 'xyz'}}, {data: {_abc: 'xyz'}});
    });

    it('should transform abc_ <-> abc_', function() {
        testTransform({data: {abc_: 'xyz'}}, {data: {abc_: 'xyz'}});
    });

    it('should transform nested abc_def.abc_def <-> abcDef.abcDef', function() {
        testTransform({data: {abc_def: {abc_def: 'xyz'}}}, {data: {abcDef: {abcDef: 'xyz'}}});
    });

    it('should transform nested abc_def.abc_def, abc_def.ghi_jkl <-> abcDef.abcDef, abcDef.ghiJkl', function() {
        testTransform({data: {abc_def: {abc_def: 'xyz', ghi_jkl: 'abc'}}}, {data: {abcDef: {abcDef: 'xyz', ghiJkl: 'abc'}}});
    });

    it('should transform nested abc.abc_def <-> abc.abcDef', function() {
        testTransform({data: {abc: {abc_def: 'xyz'}}}, {data: {abc: {abcDef: 'xyz'}}});
    });

    it('should handle empty root array', function() {
        testTransform({data: []}, {data: []});
    });

    it('should camelize array of objects', function() {
        testTransform({data: [{abc_def: 'xyz'}, {ghi_jkl: 'abc'}]}, {data: [{abcDef: 'xyz'}, {ghiJkl: 'abc'}]});
    });

    it('should handle array of strings', function() {
        testTransform({data: ['abc', 'def']}, {data: ['abc', 'def']});
    });

    it('should handle array of numbers', function() {
        testTransform({data: [1, 2, 3]}, {data: [1, 2, 3]});
    });
});
