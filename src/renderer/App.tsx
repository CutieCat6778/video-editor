import { useState } from "react";
import CreateTableLine from "./component/CreateTableLine";
import { ShuffleArray } from "./lib/functions";
import React from "react";
import { ipcRenderer } from "electron";

export interface Path {
    path: string;
    index: number;
    status: number;
    length: number;
}

function App() {
    const [repeatRandom, setRepeatRandom] = useState(1);
    const [path, setPath] = useState<Path[]>([]);
    const [imagePath, setImagePath] = useState<Path[]>([]);
    const [randomPath, setRandomPath] = useState<Path[]>([]);
    const [initPath, setInitPath] = useState<Path[]>([]);
    const [initCount, setInitCount] = useState(0);
    const [randomCount, setRandomCount] = useState<number[]>([0]);
    const [defaultAudio, setDefaultAudio] = useState(false);
    const [compression, setCompression] = useState(0);

    function removePath(index: number) {
        setPath((prev) => {
            return prev.filter((a) => a.index !== index);
        });
    }
    function removeImagePath(index: number) {
        setImagePath((prev) => {
            return prev.filter((a) => a.index !== index);
        });
    }

    return (
        <div className="w-screen h-screen bg-zinc-900">
            <div className="overflow-y-auto h-1/2">
                <table className="border w-full">
                    <tr>
                        <th>Thứ Tự</th>
                        <th>Path</th>
                        <th>Thời lượng</th>
                        <th>Tiến trình</th>
                        <th>Action</th>
                    </tr>
                    {path
                        .sort((a, b) => a.index - b.index)
                        .map((a) => {
                            return (
                                <CreateTableLine
                                    data={a}
                                    removePath={removePath}
                                />
                            );
                        })}
                </table>
                <table className="border w-full">
                    <tr>
                        <th>Thứ Tự</th>
                        <th>Path</th>
                        <th>Độ phân giải</th>
                        <th>Tiến trình</th>
                        <th>Action</th>
                    </tr>
                    {imagePath
                        .sort((a, b) => a.index - b.index)
                        .map((a) => {
                            return (
                                <CreateTableLine
                                    data={a}
                                    removePath={removeImagePath}
                                />
                            );
                        })}
                </table>
            </div>

            <div className="flex justify-between align-center w-full h-1/2 fixed bottom-0 bg-zinc-700">
                <div className="w-1/2 h-full flex flex-col justify-start items-start bg-zinc-800 p-1 border">
                    <div className="flex items-center justify-start">
                        <span className="font-bold mr-auto">
                            File audio (đầu tiên):
                        </span>
                        <input
                            id="audio-1-count"
                            className="h-min w-10 text-center ml-4"
                            type="number"
                            value={initCount}
                            onChange={(e) => {
                                setInitCount(parseInt(e.target.value));
                            }}
                        />
                        <input
                            accept=".mp3"
                            id="audio-1"
                            className="ml-4 h-min w-min rounded-lg"
                            type="file"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    const path = Array.from(files).map(
                                        (file) => file.path
                                    );
                                    setInitPath(() => {
                                        const newArr = [];
                                        for (let i = 0; i < initCount; i++) {
                                            newArr.push({
                                                path: path[0],
                                                index: i,
                                                status: 0,
                                                length: 0,
                                            });
                                        }
                                        return newArr;
                                    });
                                }
                            }}
                            {...{ disabled: initCount === 0 }}
                        />
                    </div>
                    <div className="flex items-center justify-start mt-4">
                        <span className="font-bold mr-auto">
                            Số lượng random:
                        </span>
                        <input
                            className="h-min w-10 text-center ml-4"
                            type="number"
                            value={repeatRandom}
                            onChange={(e) => {
                                setRepeatRandom(parseInt(e.target.value));
                                setRandomCount((prev) => {
                                    return [...prev, 0];
                                });
                            }}
                        />
                        <input
                            id="audio-1"
                            className="ml-4 h-min w-min rounded-lg opacity-0"
                            type="file"
                            disabled
                        />
                    </div>
                    <div className="overflow-y-auto">
                        {new Array(repeatRandom).fill(0).map((a, index) => {
                            return (
                                <div className="flex items-center justify-start bg-zinc-600 p-1">
                                    <span className="font-bold mr-auto">
                                        Random #{index}
                                    </span>
                                    <input
                                        id="audio-2-count"
                                        className="h-min w-10 text-center ml-4"
                                        type="number"
                                        value={randomCount[index] || 0}
                                        onChange={(e) => {
                                            const number = parseInt(
                                                e.target.value
                                            );
                                            if (number == -1) return;
                                            setRandomCount((prev) => {
                                                const newArr = [...prev];
                                                newArr[index] = number;
                                                return newArr;
                                            });
                                        }}
                                    />
                                    <input
                                        accept=".mp3"
                                        id="audio-2"
                                        className="ml-4 h-min w-min rounded-lg"
                                        type="file"
                                        multiple
                                        placeholder="Chọn thư mục"
                                        {...{
                                            disabled: randomCount[index] === 0,
                                        }}
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            console.log(files);
                                            if (files) {
                                                const path = Array.from(
                                                    files
                                                ).map((file) => file.path);
                                                if (randomCount[index] == -1)
                                                    return;
                                                setRandomPath((prev) => {
                                                    const newArr = prev;
                                                    for (
                                                        let i = 0;
                                                        i < path.length;
                                                        i++
                                                    ) {
                                                        for (
                                                            let j = index;
                                                            j <
                                                            randomCount[index];
                                                            j++
                                                        ) {
                                                            console.log(i, j);
                                                            newArr.push({
                                                                path: path[i],
                                                                index: index,
                                                                status: 0,
                                                                length: 0,
                                                            });
                                                        }
                                                    }
                                                    randomCount[index] = -1;
                                                    return newArr;
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-start mt-auto">
                        <span className="font-bold mr-auto">Chọn output:</span>
                        <input
                            id="folder"
                            className="ml-4 h-min w-min rounded-lg"
                            type="file"
                            /* @ts-expect-error */
                            directory=""
                            webkitdirectory=""
                        />
                    </div>
                    <button
                        className="ml-auto bg-green-700 font-bold p-1 rounded-sm"
                        onClick={() => {
                            setPath((prev) => {
                                return [
                                    ...prev,
                                    initPath,
                                    ShuffleArray(randomPath),
                                ].flat();
                            });
                            window.preloadApiThing.renderAudio({ output: "file.mp3", paths: path });
                        }}
                    >
                        Thêm vào
                    </button>
                </div>
                <div className="w-1/2 h-full flex justify-start flex-col items-start p-2 border">
                    <div className="inline w-full h-30">
                        <span className="font-bold mr-auto">Độ phân giải</span>
                        <select
                            onChange={(e) => {
                                console.log(e.target.value);
                            }}
                            className=" ml-4"
                        >
                            <option value="fhd">1920x1080</option>
                            <option value="2k">2560x1440</option>
                            <option value="4k">3840x2160</option>
                        </select>
                    </div>
                    <div className="inline w-full h-30">
                        <span className="font-bold mr-auto">
                            {!defaultAudio ? "File nhạc" : "Lấy file ren"}
                        </span>
                        <input
                            className="ml-3"
                            type="checkbox"
                            {...{ checked: defaultAudio }}
                            onClick={() => {
                                setDefaultAudio(!defaultAudio);
                            }}
                        ></input>
                        <input
                            accept=".mp3"
                            className="mt-1 ml-4 h-min w-min rounded-lg"
                            type="file"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    const path = Array.from(files).map(
                                        (file) => file.path
                                    );
                                    setPath(() => {
                                        const newArr = [
                                            {
                                                path: path[0],
                                                index: 0,
                                                status: 0,
                                                length: 0,
                                            },
                                        ];
                                        return newArr;
                                    });
                                }
                            }}
                            {...{ disabled: defaultAudio }}
                        />
                    </div>
                    <div className="inline w-full h-30">
                        <span className="font-bold mr-auto">File Ảnh</span>
                        <input
                            accept="image/png, image/jpeg, image/jpg"
                            className="mt-1 ml-4 h-min w-min rounded-lg"
                            type="file"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    const paths = Array.from(files).map(
                                        (file) => file.path
                                    );
                                    setImagePath((prev) => {
                                        const newArr = prev;
                                        for (let i = 0; i < paths.length; i++) {
                                            newArr.push({
                                                path: paths[i],
                                                index: i,
                                                status: 100,
                                                length: 19201080 * 1000 * 60,
                                            });
                                        }
                                        return newArr;
                                    });
                                }
                            }}
                            multiple
                        />
                    </div>
                    <div className="inline w-full h-30">
                        <span className="font-bold min-w-1/2">Nén %</span>
                        <input
                            type="number"
                            className="mt-1 w-12 ml-4 text-center"
                            value={compression}
                            onChange={(e) => {
                                setCompression((prev) =>
                                    prev > parseInt(e.target.value)
                                        ? prev - 5 < 0
                                            ? 0
                                            : prev - 5
                                        : prev + 5 > 100
                                        ? 100
                                        : prev + 5
                                );
                            }}
                        />
                    </div>
                    <div className="inline w-full h-30">
                        <h3 className="font-bold inline-block">File đè lên</h3>
                        <input
                            accept="image/png, image/jpeg, image/jpg"
                            className="mt-1 ml-4 h-min w-min rounded-lg"
                            type="file"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    const path = Array.from(files).map(
                                        (file) => file.path
                                    );
                                    setInitPath(() => {
                                        const newArr = [];
                                        for (let i = 0; i < initCount; i++) {
                                            newArr.push({
                                                path: path[0],
                                                index: i,
                                                status: 0,
                                                length: 0,
                                            });
                                        }
                                        return newArr;
                                    });
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
