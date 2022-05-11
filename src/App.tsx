import { Box, Button, FormControl, FormErrorMessage, FormLabel, HStack, VStack, Text } from "@chakra-ui/react";
import { readTextFile } from "@tauri-apps/api/fs";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import { simpleOccupation, SimpleOccupationResult } from "./backend";
import { FilePicker } from "./components/FilePicker";
import ShapeDisplay from "./components/ShapeDisplay";
import { Shape } from "./interfaces/shape";

interface FormValues {
  filepath: string | null;
}

export default function App() {
  const shapeDisplayParentRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const [shapes, setShapes] = useState<Shape[]>([]);

  const [occupationResult, setOccupationResult] = useState<SimpleOccupationResult>();

  return (
    <VStack as="main" p={4} spacing={4} minHeight="100vh">
      <Box borderWidth="1px" borderRadius="lg" p={4} w="full" shadow="md">
        <Formik<FormValues>
          initialValues={{
            filepath: null,
          }}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            if (!values.filepath) {
              return;
            }

            try {
              const data = await readTextFile(values.filepath);
              const json = JSON.parse(data);

              setShapes(json.shapes);

              const result = await simpleOccupation(json.shapes);
              setOccupationResult(result);

              console.log(result);
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

      <Box
        ref={shapeDisplayParentRef}
        position="relative"
        borderWidth="1px"
        borderRadius="lg"
        mb={4}
        flex={1}
        w="full"
        shadow="md"
      >
        <ShapeDisplay parentRef={shapeDisplayParentRef} shapes={shapes} />
        {occupationResult && (
          <Box position="absolute" width="full" textAlign="center" opacity={0.75}>
            Occupation calculated in {occupationResult.elapsed.toFixed(6)}ms. Result: {occupationResult.occupation}
          </Box>
        )}
      </Box>
    </VStack>
  );
}
