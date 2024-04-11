import React from "react";
import { Path } from "../App";

export default function CreateTableLine({ data, removePath }: { data: Path, removePath: (index: number) => void}) {
    return (
        <tr>
            <td>
                {data.index}
            </td>
            <td className="text-left px-3">
                {data.path}
            </td>
            <td>
                {data.length / 1000 / 60} { data.length > 1000000000 ? "" : "giây"}
            </td>
            <td>
                {data.status} %
            </td>
            <td className="bg-red-600 w-16">
                <button className="font-bold uppercase" onClick={() => removePath(data.index)}>
                    Xóa
                </button>
            </td>
        </tr>
    )
}