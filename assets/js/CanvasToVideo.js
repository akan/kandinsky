/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
var canvasToVideo={
    "project":{
        "width":720,
        "height":480,
        "framerate":30,
        "name":"kandinsky"
    },
    "canvas":null,
    "getAllFrames":function(callBack){
        Playback.instance().events.fire(KandinskyEvents.PLAY_PAUSE,{"type":"pause"});
        Playback.instance().events.fire(KandinskyEvents.PLAY_PAUSE,{"type":"play"});
        //var playBtn=Container.instance().container._children.last._children.last._children.first.__next;
        var videoBtn=Container.instance().container._children.last._children.last._children.last;
        //playBtn.events.fire(KandinskyEvents.PLAY_PAUSE,{"type":"play"});
        var canvas=Container.instance().container.children()[0];
        
        var len=Drawing.instance().lines.length;
        var ms = (function(l) {
            if (l <= 2) {
                return 1000
            }
            if (l == 3) {
                return 1330
            }
            if (l == 4) {
                return 1446
            }
            if (l == 5) {
                return 1665
            }
            return 308 * l
        }
        )(len);
        var frameLen=Math.round(ms*30/1000.0);
        var frameIndex=0;
        var frames=[];
        var getFrameT=setInterval(function(){
            var canvasDataURL = canvas.toDataURL('image/jpeg', 0.65);
            var frameImage = new Image();
            frameImage.onload = function () {
                setTimeout(function () {
                    frames.push(frameImage);
                    frameIndex++;
                    if(frameIndex==(frameLen-1)){
                        clearInterval(getFrameT);
                        callBack(frames);
                        Playback.instance().events.fire(KandinskyEvents.PLAY_PAUSE,{"type":"pause"});
                    }                               
                })
            }
            frameImage.src = canvasDataURL;
            
        },1000.0/30);
    },
    getAllFramesWithSound:function(callBack){
        var lines=Drawing.instance().lines;
        var frames=[];
        var line = lines.start();
        var i=0;
        while (line) {
            var frame={};
            frame.item=line.getSound();
            frame.index=i;
            frame.timeStart=i*300;
            frames.push(frame);
            i++;
            line = lines.next();
        }
        return frames;
    }
}    
var VideoExporterInterface = function (canvasToVideo) {
    var self = this;
    var videoExportWindow = document.getElementById('videoExportGUI');
    var closeButton; 
    var sparkText; 
    var progressBar; 
    var downloadButton;

    var videoExporter;

    var qualityOptions = {
        "Ultra" : 1, 
        "High" : 5, 
        "Medium" : 15, 
        "Low" : 31,
    }; 
    var defaultQuality = "High"; 
    var chosenQuality = defaultQuality; 
    var qualityDropdown; 

    self.setup = function () {
        // Add title
        /*var title = document.createElement('div');
        title.className = "GUIBoxTitle"; 
        title.id = "videoExportGUITitle";
        title.innerHTML = "Wick Video Exporter"; 
        videoExportWindow.appendChild(title); */

        // Add Close Button
        closeButton = document.createElement('div'); 
        closeButton.className = "GUIBoxCloseButton"; 
        closeButton.id = "videoExportGUICloseButton"; 
        closeButton.addEventListener('click', self.close);
        videoExportWindow.appendChild(closeButton);

        // Add Spark Text
        sparkText = document.createElement('div'); 
        sparkText.id = "videoExportSparkText"; 
        sparkText.className = "sparkText"; 
        sparkText.innerHTML = "Exporting Your Video...";
        videoExportWindow.appendChild(sparkText); 

        // Add Progress Bar
        var progressBarContainer = document.createElement('div'); 
        progressBarContainer.className = "meter animate wickGreen"; 
        progressBarContainer.id = "videoExportProgressBarContainer"; 
        progressBar = document.createElement('span');
        progressBar.id = "videoExportProgressBar";
        progressBar.style.width = "1%";
        progressBarContainer.appendChild(progressBar); 
        var extraSpan = document.createElement('span'); 
        progressBar.appendChild(extraSpan); 
        videoExportWindow.appendChild(progressBarContainer); 

        // Add Settings Menu
        var settingsContainer = document.createElement('div');
        settingsContainer.id = "videoExportSettingsContainer";
        videoExportWindow.appendChild(settingsContainer); 

        var qualityContainer = document.createElement('div');
        qualityContainer.className = "quality-container"; 
        settingsContainer.appendChild(qualityContainer);

        var qualitySettingTitle = document.createElement('div'); 
        qualitySettingTitle.innerText = "Quality: ";  
        qualitySettingTitle.id = "qualitySettingTitle"; 
        qualityContainer.appendChild(qualitySettingTitle); 

        qualityDropdown = document.createElement('div'); 
        qualityDropdown.id="videoExportQualityDropdown";
        qualityDropdown.className="dropbtn"; 
        qualityDropdown.onclick = function () {
            dropdownContainer.classList.toggle("show")
        };
        qualityContainer.appendChild(qualityDropdown); 

        var dropdownTitleDiv = document.createElement('div'); 
        dropdownTitleDiv.id = "videoExportQualityTitleDiv"; 
        dropdownTitleDiv.innerText=chosenQuality;
        dropdownTitleDiv.class="title-div";
        qualityDropdown.appendChild(dropdownTitleDiv); 

        var dropdownContainer = document.createElement('div'); 
        dropdownContainer.className = "dropdown-content"; 

        for(quality in qualityOptions) {
            var elem = document.createElement('div'); 
            elem.innerHTML = quality; 
            elem.className = "dropdown-item";
            (function (q) {
                elem.onclick = function () {
                    self.setVideoQuality(q); 
                };
            })(quality); 
            dropdownContainer.appendChild(elem); 
        }
        qualityDropdown.appendChild(dropdownContainer); 

        // Add Download Button
        downloadButton = document.createElement('div'); 
        downloadButton.className = "videoDownloadButton"; 
        downloadButton.innerHTML = "Export Video"; 
        downloadButton.addEventListener('click', self.exportVideo);
        settingsContainer.appendChild(downloadButton); 
    }
    
    self.setVideoQuality = function (qualitySetting) {
        var titleDiv = qualityDropdown.querySelector("#videoExportQualityTitleDiv"); 

        if (qualityOptions[qualitySetting]) {
            chosenQuality = qualitySetting; 
            titleDiv.textContent = chosenQuality; 
        } else {
            chosenQuality = defaultQuality; 
            titleDiv.textContent = chosenQuality;
            console.error(qualitySetting + " is not a valid video quality setting! Defaulting to High Quality."); 
        }
    }

    self.syncWithEditorState = function () {

    }
    
    self.setProgressBarPercent = function (percent) {
        percent = percent*100

        if (typeof percent != "number") {
            console.error("Error: Input percentage is not a number."); 
            return; 
        }

        if(percent >= 100) {
            progressBar.style.width = "100%";
        } else if (percent <= 0) {
            progressBar.style.width = "0%";
        } else {
            progressBar.style.width = percent + "%";
        }
    }

    self.setSparkText = function (newSparkText) {
        self.setProgressBarPercent(0)
        sparkText.innerHTML = newSparkText; 
    }
    
    self.open = function () {
        self.setSparkText('Ready to export video.');
        self.setProgressBarPercent(0);
        videoExportWindow.style.display = "block"; 
    }
    
    self.close = function () {
        videoExportWindow.style.display = "none";
    }
    
    self.exportVideo = function () {
        if(!videoExporter) {
            videoExporter = new VideoExporter();
            videoExporter.setProgressBarFn(self.setProgressBarPercent)
            videoExporter.init();
        }

        canvasToVideo.getAllFrames(function (frames) {
            renderVideoFromFrames(frames, function (videoBuffer) {
                generateAudioTrack(function (audioBuffer) {
                    if(!audioBuffer) {
                        downloadVideo(videoBuffer);
                    } else {
                        mergeAudioTrackWithVideo(videoBuffer, audioBuffer, function (finalVideoBuffer) {
                            downloadVideo(finalVideoBuffer);
                        });
                    }
                });
            });
        });

    }

    function renderVideoFromFrames (frames, callback) {
        self.setSparkText('Converting frames to video...')

        videoExporter.renderVideoFromFrames({
            quality: qualityOptions[chosenQuality],
            frames: frames,
            framerate: canvasToVideo.project.framerate,
            completedCallback: function (videoArrayBuffer) {
                var videoBuffer = new Uint8Array(videoArrayBuffer);
                callback(videoBuffer);
            }
        })
    }

    function generateAudioTrack (callback) {
        self.setSparkText('Generating audio track...')

        var soundFrames = canvasToVideo.getAllFramesWithSound();
        if(soundFrames.length === 0) {
            console.log('Video has no sound. Skipping audio export.')
            callback(null);
            return;
        }

        soundFrames.forEach(function (soundFrame) {
            //var library = canvasToVideo.project.library;
            //var asset = library.getAsset(soundFrame.audioAssetUUID);
            //var src = asset.getData();
            //videoExporter.addAudioTrack(
            //    convertDataURIToBinary(src),
            //    0,
            //    soundFrame.length / canvasToVideo.project.framerate,
            //    1 + (soundFrame.playheadPosition / canvasToVideo.project.framerate * 1000),
            //)
            var sound=soundFrame.item.sound;
            videoExporter.addAudioTrack(
                sound._arraybuffer,
                0,
                0.3,
                1 + soundFrame.timeStart,
            )
        })

        videoExporter.mergeAudioTracks({
            callback: function (soundTrackArrayBuffer) {
                var soundBuffer = new Uint8Array(soundTrackArrayBuffer);
                callback(soundBuffer);
            }
        })
    }

    function mergeAudioTrackWithVideo (videoBuffer, audioBuffer, callback) {
        self.setSparkText('Merging audio and video...')

        videoExporter.combineAudioAndVideo({
            videoBuffer: videoBuffer,
            soundBuffer: audioBuffer,
            framerate: canvasToVideo.project.framerate,
            filename: 'test.mp4',
            percentCallback: console.log,
            completedCallback: callback,
        })
    }

    function downloadVideo (videoBuffer) {
        self.setSparkText('Finished exporting!')
        self.setProgressBarPercent(1);
        var blob = new Blob([videoBuffer], {type: "application/octet-stream"});
        var fileName = canvasToVideo.project.name + '.mp4';
        saveAs(blob, fileName);
        window.isExportingVideo=false;
        window.my_ve.close();
    }
}
window.vconsole = new VConsole();
window.isExportingVideo=false;
function exportingVideo(){
    if(window.isExportingVideo){
        return;
    }
    if(!window.my_ve){
        window.my_ve=new VideoExporterInterface(canvasToVideo);
        window.my_ve.setup();
    }    
    window.isExportingVideo=true;
    if(Device.mobile){
        window.my_ve.exportVideo();
    }else{
        window.my_ve.open(); 
    }
}
