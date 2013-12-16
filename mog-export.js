(function() {
"use strict";

var exportData = {
    screen_name: Mog.current_user.attributes.screen_name,
    export_date: new Date().toString(),
    artist_favorites: [],
    album_favorites: [],
    track_favorites: [],
    playlist_favorites: [],
    user_playlists: []
};

function pareItemForExport(item) {
    var pared = {};
    ["artist_id", "artist_name", "album_id", "album_name", "duration", "track_id", "track_name"].forEach(function copyProp(key){
        pared[key] = item[key];
    });
    return pared;
}

function prepareDataForExport(data) {
    var protoId = Object.getPrototypeOf(data).idAttribute;
    if (protoId) {
        exportData[protoId.replace("_id","_favorites")].push(pareItemForExport(data.attributes));
    } else {
        exportData[data.user_id == Mog.current_user.attributes.user_id ? "user_playlists" : "playlist_favorites"].push({
            name: data.name,
            description: data.description,
            tracks: data.tracks.map(pareItemForExport)
        });
    }
    
    if (dataIsReadyForExport()) {
        exportJSON();
    }
}

function dataIsReadyForExport() {
    return exportData.artist_favorites.length == artistFavorites.models.length &&
        exportData.album_favorites.length == albumFavorites.models.length &&
        exportData.track_favorites.length == trackFavorites.models.length &&
        exportData.playlist_favorites.length == playlistFavorites.models.length &&
        exportData.user_playlists.length == Mog.userPlaylists.models.length;
}

function exportJSON() {
    var download = document.createElement('a');
    download.href = 'data:application/json;charset=utf-8,' + encodeURIComponent( JSON.stringify(exportData, null, '\t') );
    download.download = 'MOG.'+exportData.screen_name+'.'+new Date().toISOString().substring(0,10)+'.json';
    download.click();
}

function getPlaylistForExport(playlist) {
    Mog.api.getPlaylist(playlist.id, prepareDataForExport);
}

artistFavorites.models.forEach(prepareDataForExport);
albumFavorites.models.forEach(prepareDataForExport);
trackFavorites.models.forEach(prepareDataForExport);
playlistFavorites.models.forEach(getPlaylistForExport);
Mog.userPlaylists.models.forEach(getPlaylistForExport);

})();
