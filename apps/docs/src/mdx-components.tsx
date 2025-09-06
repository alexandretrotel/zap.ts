import { File, Files, Folder } from "fumadocs-ui/components/files";
import {
  Tab,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import {
  FileEntry,
  FileListContainer,
  FileListRenderer,
} from "@/components/file-entry";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { DependencyList } from "./components/dependency-list";

const FileEntryComponents = {
  FileEntry,
  FileListContainer,
  FileListRenderer,
  DependencyList,
};

const FileComponents = {
  File,
  Files,
  Folder,
};

const TabsComponents = {
  Tab,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
};

const TableComponents = {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...FileComponents,
    ...TableComponents,
    ...FileEntryComponents,
    ...components,
  };
}
