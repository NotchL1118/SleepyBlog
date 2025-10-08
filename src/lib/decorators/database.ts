import connectToDatabase from "@/lib/mongodb";

export const withDatabaseConnection: () => MethodDecorator =
  () =>
  <T>(
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> | void => {
    if (!descriptor.value || typeof descriptor.value !== "function") {
      return descriptor;
    }

    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    const wrapped = async function (this: unknown, ...args: unknown[]): Promise<unknown> {
      console.log("🔐withDatabaseConnection---->");
      await connectToDatabase();
      return originalMethod.apply(this, args);
    };

    descriptor.value = wrapped as unknown as T;
    return descriptor;
  };
