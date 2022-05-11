import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { readTextFile } from "@tauri-apps/api/fs";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import {
  FilterResult,
  genericFilter,
  genericOccupation,
  objectFilter,
  objectOccupation,
  OccupationResult,
  simpleFilter,
  simpleOccupation,
} from "./backend";
import { FilePicker } from "./components/FilePicker";
import ShapeDisplay from "./components/ShapeDisplay";
import { Shape } from "./interfaces/shape";

interface FormValues {
  filepath: string | null;
  mode: "simple" | "object" | "generic";
  threads: number;
  enableCircles: boolean;
  enableRectangles: boolean;
}

interface CalculationResult {
  occupation: number;
  elapsed: {
    filter: number;
    occupation: number;
  };
}

export default function App() {
  const shapeDisplayParentRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const [shapes, setShapes] = useState<Shape[]>([]);

  const [calculationResult, setCalculationResult] = useState<CalculationResult>();

  return (
    <VStack as="main" p={4} spacing={4} minHeight="100vh">
      <Box borderWidth="1px" borderRadius="lg" p={4} w="full" shadow="md">
        <Formik<FormValues>
          initialValues={{
            filepath: null,
            mode: "simple",
            threads: 1,
            enableCircles: true,
            enableRectangles: true,
          }}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            if (!values.filepath) {
              return;
            }

            try {
              const data = await readTextFile(values.filepath);
              const json = JSON.parse(data);

              if (!values.enableCircles && !values.enableRectangles) {
                setShapes([]);
                setCalculationResult({
                  occupation: 0,
                  elapsed: {
                    filter: 0,
                    occupation: 0,
                  },
                });
              } else {
                let shapes = json.shapes;
                let filterResult: FilterResult<Shape> | null = null;

                if (!values.enableCircles) {
                  if (values.mode === "simple") {
                    filterResult = await simpleFilter(shapes, "rectangle", values.threads);
                  } else if (values.mode === "object") {
                    filterResult = await objectFilter(shapes, "rectangle", values.threads);
                  } else if (values.mode === "generic") {
                    filterResult = await genericFilter(shapes, "rectangle", values.threads);
                  }
                } else if (!values.enableRectangles) {
                  if (values.mode === "simple") {
                    filterResult = await simpleFilter(shapes, "circle", values.threads);
                  } else if (values.mode === "object") {
                    filterResult = await objectFilter(shapes, "circle", values.threads);
                  } else if (values.mode === "generic") {
                    filterResult = await genericFilter(shapes, "circle", values.threads);
                  }
                }

                shapes = filterResult?.filtered ?? shapes;

                let occupationResult: OccupationResult | null = null;

                if (values.mode === "simple") {
                  occupationResult = await simpleOccupation(shapes, values.threads);
                } else if (values.mode === "object") {
                  occupationResult = await objectOccupation(shapes, values.threads);
                } else if (values.mode === "generic") {
                  occupationResult = await genericOccupation(shapes, values.threads);
                } else {
                  throw new Error("Unknown mode");
                }

                setCalculationResult({
                  occupation: occupationResult.occupation,
                  elapsed: {
                    filter: filterResult?.elapsed ?? 0,
                    occupation: occupationResult.elapsed,
                  },
                });
                setShapes(shapes);
              }
            } catch (e) {
              console.error(e);

              if (e instanceof Error) {
                setFieldError("filepath", e.message);
              } else {
                setFieldError("filepath", "Unknown error");
              }
            }

            setSubmitting(false);
          }}
        >
          {(props) => (
            <Form>
              <VStack>
                <HStack w="full" spacing={4} align="end">
                  <Field name="filepath">
                    {({ field, meta }: FieldProps<FormValues["filepath"]>) => (
                      <FormControl isInvalid={!!meta.error && meta.touched} isRequired>
                        <FormLabel htmlFor="filepath">Shape file</FormLabel>
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

                  <Field name="threads">
                    {({ field, meta }: FieldProps<FormValues["threads"]>) => (
                      <FormControl isInvalid={!!meta.error && meta.touched} isRequired>
                        <FormLabel htmlFor="threads">Threads</FormLabel>
                        <NumberInput
                          id="threads"
                          {...field}
                          pattern="([0-9]*(.[0-9]+)?)|(Pipeline)"
                          format={(value) => value === 0 ? "Pipeline" : value}
                          onChange={(value) => {
                            const numberValue = Number(value.replace(/\D/g, ""));
                            props.setFieldValue("threads", Number.isNaN(numberValue) ? 0 : numberValue);
                          }}
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </HStack>

                <HStack w="full" spacing={4}>
                  <Field name="mode">
                    {({ field, meta }: FieldProps<FormValues["mode"]>) => (
                      <FormControl as="fieldset" isInvalid={!!meta.error && meta.touched} isRequired>
                        <FormLabel as="legend" htmlFor="mode" hidden>
                          Mode
                        </FormLabel>
                        <RadioGroup {...field} onChange={(value) => props.setFieldValue("mode", value)}>
                          <Stack spacing={4} direction="row">
                            <Radio value="simple">Simple</Radio>
                            <Radio value="object">Object</Radio>
                            <Radio value="generic">Generic</Radio>
                          </Stack>
                        </RadioGroup>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Stack spacing={5} direction="row">
                    <Field name="enableCircles">
                      {({ field, meta }: FieldProps<FormValues["enableCircles"]>) => (
                        <FormControl isInvalid={!!meta.error && meta.touched}>
                          <Checkbox
                            isChecked={field.value}
                            onChange={(e) => props.setFieldValue("enableCircles", e.target.checked)}
                          >
                            Circles
                          </Checkbox>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="enableRectangles">
                      {({ field, meta }: FieldProps<FormValues["enableRectangles"]>) => (
                        <FormControl isInvalid={!!meta.error && meta.touched}>
                          <Checkbox
                            isChecked={field.value}
                            onChange={(e) => props.setFieldValue("enableRectangles", e.target.checked)}
                          >
                            Rectangles
                          </Checkbox>
                        </FormControl>
                      )}
                    </Field>
                  </Stack>

                  <Button type="submit">Submit</Button>
                </HStack>
              </VStack>
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
      </Box>

      {calculationResult && (
        <Box borderWidth="1px" borderRadius="lg" p={4} w="full" shadow="md">
          <Box width="full" textAlign="center" opacity={0.75}>
            Filtering calculated in {calculationResult.elapsed.filter.toFixed(6)}ms. Occupation calculated in{" "}
            {calculationResult.elapsed.occupation.toFixed(6)}ms. Result: {calculationResult.occupation}
          </Box>
        </Box>
      )}
    </VStack>
  );
}
