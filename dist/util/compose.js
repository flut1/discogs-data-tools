import { identity } from "../xmlTransformer/xmlTransformer";
export default function compose(...fns) {
    if (fns.length === 0)
        return identity;
    if (fns.length === 1)
        return fns[0];
    return fns.reduce((a, b) => (...args) => a(b(args)));
}
// export interface ComposeFn {
//   <F1 extends Mapper<TInput>>(f: F1): F1;
//   <F2 extends Mapper<TInput>, F1 extends Mapper<ReturnType<F2>>>(
//     f: F1,
//     f2: F2
//   ): (i: TInput) => ReturnType<F1>;
//   <
//     F3 extends Mapper<TInput>,
//     F2 extends Mapper<ReturnType<F3>>,
//     F1 extends Mapper<ReturnType<F2>>
//     >(
//     f: F1,
//     f2: F2,
//     f3: F3
//   ): (i: TInput) => ReturnType<F1>;
//   <
//     F4 extends Mapper<TInput>,
//     F3 extends Mapper<ReturnType<F4>>,
//     F2 extends Mapper<ReturnType<F3>>,
//     F1 extends Mapper<ReturnType<F2>>
//     >(
//     f: F1,
//     f2: F2,
//     f3: F3,
//     f4: F4
//   ): (i: TInput) => ReturnType<F1>;
//   <F1 extends Mapper>(f1: F1, ...fns: Array<Mapper>): ReturnType<F1>;
// }
