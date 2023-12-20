const concat = require("ffmpeg-concat");
const os = require("os");
const fs = require("fs");

const RANDOM = false;
const SOURCE_FOLDER = ".\\source";

function shuffleArray(array) {
    // Create a copy of the original array to avoid modifying the input array
    const shuffledArray = array.slice();

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex],
            shuffledArray[i],
        ];
    }

    return shuffledArray;
}

// Input file paths
const filesName = fs.readdirSync(SOURCE_FOLDER, { encoding: "utf-8" });

let inputFiles = filesName.map((a) => `${SOURCE_FOLDER}\\${a}`);
if(RANDOM) inputFiles = shuffleArray(inputFiles);

return concat({
    output: "final.mp4",
    videos: inputFiles,
    transition: {
        name: "fade",
        duration: 3000,
    },
    args: ["-movflags", "faststart"],
    frameFormat: "png",
    concurrency: 4,
    tempDir: os.tmpdir() + "\\ffmpeg-concat\\",
});
