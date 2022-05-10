import type { InputProps } from "@chakra-ui/react";
import { Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { open } from "@tauri-apps/api/dialog";
import { FiFile } from "react-icons/fi";

export type FilePickerProps = Omit<InputProps, "value"> & {
  value: string | string[] | null;
  setFieldValue: (filepath: string | string[] | null) => void;
};

export function FilePicker({ id, name, value, onClick, multiple, setFieldValue, ...props }: FilePickerProps) {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Icon as={FiFile} />
      </InputLeftElement>

      <Input
        onClick={async (e) => {
          onClick?.(e);

          if (!e.defaultPrevented) {
            const filepath = await open({ multiple });
            setFieldValue(filepath);
          }
        }}
        readOnly={true}
        value={value ?? ""}
        cursor="pointer"
        {...props}
      />
    </InputGroup>
  );
}
