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
  Switch,
  VStack,
} from "@chakra-ui/react";
import { readTextFile } from "@tauri-apps/api/fs";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import {
  FilterResult,
  genericFilter,
  genericMutationCirclesToRectangles,
  genericOccupation,
  MutationResult,
  objectFilter,
  objectMutationCirclesToRectangles,
  objectOccupation,
  OccupationResult,
  simpleFilter,
  simpleMutationCirclesToRectangles,
  simpleOccupation,
} from "./backend";
import { FilePicker } from "./components/FilePicker";
import ShapeDisplay from "./components/ShapeDisplay";
import { Shape } from "./interfaces/shape";
import "./styles.css";

interface FormValues {
  mode: "simple" | "object" | "generic";
  threads: number;
  enableCircles: boolean;
  enableRectangles: boolean;
  enableCirclesToRectangles: boolean;
}

interface CalculationResult {
  occupation: number;
  elapsed: {
    filter: number;
    mutation: number;
    occupation: number;
  };
}

export default function App() {
  const shapeDisplayParentRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [displayShapes, setDisplayShapes] = useState<Shape[]>([]);

  const [filepath, setFilepath] = useState<string>("");

  const [calculationResult, setCalculationResult] = useState<CalculationResult>();

  const loadFile = async () => {
    try {
      const data = await readTextFile(filepath);
      const json = JSON.parse(data);

      setShapes(json.shapes ?? []);
      setDisplayShapes(json.shapes ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <VStack as="main" p={4} spacing={4} minHeight="100vh">
      <Box borderWidth="1px" borderRadius="lg" p={4} w="full" shadow="md">
        <Formik<FormValues>
          initialValues={{
            mode: "simple",
            threads: 0,
            enableCircles: true,
            enableRectangles: true,
            enableCirclesToRectangles: false,
          }}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              if (!values.enableCircles && !values.enableRectangles) {
                setDisplayShapes([]);
                setCalculationResult({
                  occupation: 0,
                  elapsed: {
                    filter: 0,
                    mutation: 0,
                    occupation: 0,
                  },
                });
              } else {
                let tempShapes = shapes;
                let filterResult: FilterResult<Shape> | null = null;

                if (!values.enableCircles) {
                  if (values.mode === "simple") {
                    filterResult = await simpleFilter(tempShapes, "rectangle", values.threads);
                  } else if (values.mode === "object") {
                    filterResult = await objectFilter(tempShapes, "rectangle", values.threads);
                  } else if (values.mode === "generic") {
                    filterResult = await genericFilter(tempShapes, "rectangle", values.threads);
                  } else {
                    throw new Error("Unknown mode");
                  }
                } else if (!values.enableRectangles) {
                  if (values.mode === "simple") {
                    filterResult = await simpleFilter(tempShapes, "circle", values.threads);
                  } else if (values.mode === "object") {
                    filterResult = await objectFilter(tempShapes, "circle", values.threads);
                  } else if (values.mode === "generic") {
                    filterResult = await genericFilter(tempShapes, "circle", values.threads);
                  } else {
                    throw new Error("Unknown mode");
                  }
                }

                tempShapes = filterResult?.filtered ?? tempShapes;

                let mutationResult: MutationResult<Shape> | null = null;

                if (values.enableCircles && values.enableCirclesToRectangles) {
                  if (values.mode === "simple") {
                    mutationResult = await simpleMutationCirclesToRectangles(tempShapes, values.threads);
                  } else if (values.mode === "object") {
                    mutationResult = await objectMutationCirclesToRectangles(tempShapes, values.threads);
                  } else if (values.mode === "generic") {
                    mutationResult = await genericMutationCirclesToRectangles(tempShapes, values.threads);
                  } else {
                    throw new Error("Unknown mode");
                  }
                }

                tempShapes = mutationResult?.values ?? tempShapes;

                let occupationResult: OccupationResult | null = null;

                if (values.mode === "simple") {
                  occupationResult = await simpleOccupation(tempShapes, values.threads);
                } else if (values.mode === "object") {
                  occupationResult = await objectOccupation(tempShapes, values.threads);
                } else if (values.mode === "generic") {
                  occupationResult = await genericOccupation(tempShapes, values.threads);
                } else {
                  throw new Error("Unknown mode");
                }

                setCalculationResult({
                  occupation: occupationResult.occupation,
                  elapsed: {
                    filter: filterResult?.elapsed ?? 0,
                    mutation: mutationResult?.elapsed ?? 0,
                    occupation: occupationResult.elapsed,
                  },
                });
                setDisplayShapes(tempShapes);
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
                  <HStack w="full" borderWidth="1px" borderRadius="lg" p={3} align="end">
                    <FormControl isRequired>
                      <FormLabel htmlFor="filepath">Shape file</FormLabel>
                      <FilePicker
                        id="filepath"
                        accept=".json"
                        value={filepath}
                        setFieldValue={(filepath) => {
                          setFilepath((Array.isArray(filepath) ? filepath[0] : filepath) ?? "");
                        }}
                        placeholder="Select a json file"
                      />
                    </FormControl>

                    <Button onClick={loadFile}>Load</Button>
                  </HStack>

                  <Box w="full" borderWidth="1px" borderRadius="lg" p={3}>
                    <Field name="threads">
                      {({ field, meta }: FieldProps<FormValues["threads"]>) => (
                        <FormControl isInvalid={!!meta.error && meta.touched} isRequired>
                          <FormLabel htmlFor="threads">Threads</FormLabel>
                          <NumberInput
                            id="threads"
                            {...field}
                            pattern="([0-9]*(.[0-9]+)?)|(Pipeline)"
                            format={(value) => (value === 0 ? "Pipeline" : value)}
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
                  </Box>
                </HStack>

                <HStack w="full" spacing={4}>
                  <HStack height="10" p={3} borderWidth="1px" borderRadius="lg" w="full" justify="space-between">
                    <Field name="mode">
                      {({ field, meta }: FieldProps<FormValues["mode"]>) => (
                        <FormControl as="fieldset" isInvalid={!!meta.error && meta.touched} isRequired w="initial">
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

                    <BsArrowRight />

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

                    <BsArrowRight />

                    <Field name="enableCirclesToRectangles">
                      {({ field, meta }: FieldProps<FormValues["enableCirclesToRectangles"]>) => (
                        <FormControl
                          isInvalid={!!meta.error && meta.touched}
                          isDisabled={!props.values.enableCircles}
                          w="initial"
                          display="flex"
                          alignItems="center"
                        >
                          <Switch
                            id="enableCirclesToRectangles"
                            isChecked={field.value}
                            onChange={(e) => props.setFieldValue("enableCirclesToRectangles", e.target.checked)}
                            paddingInlineEnd={3}
                            cursor="pointer"
                          />
                          <FormLabel
                            htmlFor="enableCirclesToRectangles"
                            marginInlineEnd={0}
                            marginBottom={0}
                            cursor="pointer"
                            fontWeight="normal"
                          >
                            Mutate circles to rectangles
                          </FormLabel>
                        </FormControl>
                      )}
                    </Field>
                  </HStack>

                  <Button type="submit">Execute</Button>
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
        <ShapeDisplay parentRef={shapeDisplayParentRef} shapes={displayShapes} />
      </Box>

      {calculationResult && (
        <Box borderWidth="1px" borderRadius="lg" p={4} w="full" shadow="md">
          <HStack width="full" justifyContent="center" textAlign="center" opacity={0.75}>
            {calculationResult.elapsed.filter !== 0 && (
              <Box>Filtering calculated in {calculationResult.elapsed.filter.toFixed(6)}ms.</Box>
            )}
            {calculationResult.elapsed.mutation !== 0 && (
              <Box>Mutation calculated in {calculationResult.elapsed.mutation.toFixed(6)}ms.</Box>
            )}
            {calculationResult.elapsed.occupation !== 0 && (
              <Box>Occupation calculated in {calculationResult.elapsed.occupation.toFixed(6)}ms.</Box>
            )}
            <Box>Result: {calculationResult.occupation}</Box>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}
