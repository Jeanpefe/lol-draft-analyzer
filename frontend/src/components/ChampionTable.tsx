import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { ChampionStats } from "../types/draft";
import { getWinrateColorClass } from "../theme";
import ChampionIcon from "./ChampionIcon";
import { ROLE_ICONS } from "../constants";
import type { Role } from "../constants";

const col = createColumnHelper<ChampionStats>();

function buildColumns(onChampionClick?: (name: string, role: string) => void) {
  return [
    col.accessor("name", {
      header: "Champion",
      cell: (info) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChampionClick?.(info.getValue(), info.row.original.role);
          }}
          className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer text-left"
        >
          <ChampionIcon name={info.getValue()} size={28} />
          <span>{info.getValue()}</span>
        </button>
      ),
    }),
    col.accessor("role", {
      header: "Role",
      cell: (info) => {
        const role = info.getValue() as Role;
        const icon = ROLE_ICONS[role];
        return icon ? (
          <img src={icon} alt={role.toUpperCase()} className="w-5 h-5" title={role.toUpperCase()} />
        ) : (
          role.toUpperCase()
        );
      },
    }),
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
          <span className={getWinrateColorClass(wr)}>
            {wr.toFixed(1)}%
          </span>
        );
      },
    }),
  ];
}

interface ChampionTableProps {
  data: ChampionStats[];
  onChampionClick?: (name: string, role: string) => void;
}

export default function ChampionTable({ data, onChampionClick }: ChampionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "games", desc: true },
  ]);

  const columns = useMemo(() => buildColumns(onChampionClick), [onChampionClick]);

  const table = useReactTable({
    data,
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
