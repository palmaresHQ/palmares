# @palmares/std

This is the palmares standard library, it offers many interfaces to interact with the environment. To make the framework more feature proof we do not want to be tied event to a specific runtime as it might change overtime (with stuff like Deno and Bun). So we want to abstract away the runtime and make it easy to change if needed.
