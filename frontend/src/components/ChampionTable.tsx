import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import type { ChampionStats } from "../types/draft";

const col = createColumnHelper<ChampionStats>();

const columns = [
  col.accessor("name", { header: "Champion" }),
  col.accessor("role", { header: "Role" }),
  col.accessor("games", { header: "Games" }),
  col.accessor("pickrate", {
    header: "Pick%",
    cell: (info) => `${info.getValue().toFixed(1)}%`,
  }),
  col.accessor("banrate", {
    header: "Ban%",
    cell: (info) => `${info.getValue().toFixed(1)}%`,
  }),
  col.accessor("winrate", {
    header: "WR",
    cell: (info) => {
      const wr = info.getValue();
      return (
        <span className={wr >= 50 ? "text-green-400" : "text-red-400"}>
          {wr.toFixed(1)}%
        </span>
      );
    },
  }),
];

interface ChampionTableProps {
  data: ChampionStats[];
}

export default function ChampionTable({ data }: ChampionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "games", desc: true },
  ]);

  const table = useReactTable({
    data: useMemo(() => data, [data]),
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-gray-700">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className="px-3 py-2 text-left text-gray-400 font-medium cursor-pointer hover:text-white select-none"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() === "asc"
                    ? " \u2191"
                    : h.column.getIsSorted() === "desc"
                      ? " \u2193"
                      : ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-800 hover:bg-gray-800/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 text-gray-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
