window.addEventListener("load", function() {
	return 0;
	setTimeout(function(){
		if (document.getElementById("problem_list") == null) {
			return 0;
		}
		var allLi = document.getElementById("problem_list").getElementsByTagName("a");
		var limit = 10;
/*		var execAnimation = function(nowId, limit){
			if( nowId >= allLi.length || nowId >= limit ) return;
			allLi[nowId].classList.remove("invincible");
			allLi[nowId].style.top = "0";
			allLi[nowId].style.left = "0";

			if( nowId+1 < allLi.length && nowId+1 < limit ){
				setTimeout(function(){ execAnimation(nowId+1, limit); }, 100);
			}
		}
		execAnimation(0, limit);
*/
		for( var i = 0 ; i < allLi.length ; ++i ){
			allLi[i].classList.remove("invincible");
			allLi[i].style.top = "0";
			allLi[i].style.left = "0";
		}

	}, 249);

});
