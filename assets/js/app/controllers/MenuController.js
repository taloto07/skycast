skycast = angular.module('skycast')

.controller('MenuController', [
	'$scope', '$uibModal', 'UserService', '$http', '$rootScope',
	function($scope, $uibModal, UserService, $http, $rootScope){

		// check if user already before refresh
		if ( UserService.isLogin() ){
			$rootScope.user = UserService.getUser();
		}

		$scope.login = function(){
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: '/templates/modals/login.html',
				controller: 'LoginController',
				size: 'sm'
			});

			modalInstance.result.then(function close(){
				$rootScope.user = UserService.getUser();
			});
		};

		$scope.signup = function(){
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: '/templates/modals/signup.html',
				controller: 'SignupController',
				size: 'sm'
			});

			modalInstance.result.then(function close(result){
				$rootScope.user = UserService.getUser();
			});
		};

		$scope.logout = function(){
			UserService.logout();
			$rootScope.user = null;
		};

		$rootScope.search = function(address){
			if (!address) return;
			
			UserService.getWeather(address).then(function(result){
				$scope.searchKey = address;
				$rootScope.chart = true;
				$rootScope.skycast = result.data.skycast;

			}, function(err){
				
				alert('Something went wrong: ' + JSON.stringify(err) );

			});
		}

		$scope.$on('history', function(){
			console.log('add history');
			var search = document.getElementById('autocomplete').value;
			UserService.addSearch(search);
		});

		var autoComplete;
		var initAutocomplete = function(){
			autoComplete = new google.maps.places.Autocomplete(
				(document.getElementById('autocomplete')),
				{type: ['geocode']}
			);
		};

		initAutocomplete();				
	}
]);