import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, HStack } from "@chakra-ui/react";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { useState } from "react";
import { FilePicker } from "./components/FilePicker";
import ShapeDisplay from "./components/ShapeDisplay";
import { Shape } from "./interfaces/shape";
import { readTextFile } from "@tauri-apps/api/fs";

interface FormValues {
  filepath: string | null;
}

export default function App() {
  const [shapes, setShapes] = useState<Shape[]>([]);

  return (
    <Flex as="main" p={4} direction="column" minHeight="100vh">
      <Box borderWidth="1px" borderRadius="lg" mb={4} flex={1} shadow="md">
        <ShapeDisplay shapes={shapes} />
      </Box>

      <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md">
        <Formik<FormValues>
          initialValues={{
            filepath: null,
          }}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            console.log(values);

            if (!values.filepath) {
              return;
            }

            try {
              console.log("Reading text");
              const data = await readTextFile(values.filepath);
              console.log(`Data: ${data}`)
              const json = JSON.parse(data);

              console.log(json.shapes);

              setShapes(json.shapes);
            } catch (e) {
              setFieldError("filepath", e as string);
            }

            setSubmitting(false);
          }}
        >
          {(props) => (
            <Form>
              <HStack spacing={4} align="end">
                <Field name="filepath">
                  {({ field, meta }: FieldProps<FormValues["filepath"]>) => (
                    <FormControl isInvalid={!!meta.error && meta.touched} isRequired>
                      <FormLabel htmlFor="filepath">Save file</FormLabel>
                      <FilePicker
                        {...field}
                        id="filepath"
                        accept=".json"
                        setFieldValue={(filepath) => props.setFieldValue("filepath", filepath)}
                        placeholder="Select a json file"
                      />
                      <FormErrorMessage>{meta.error}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Button type="submit">Submit</Button>
              </HStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Flex>
  );
}
