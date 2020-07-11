import { createXMLTransformer, IGNORE_NODE, ignoreNodeTransformer, useResult, XMLTransformerError, } from "./xmlTransformer";
export const requireProps = (silent, ...props) => (input) => {
    for (const prop of props) {
        if (!input[prop] && typeof input[prop] !== "number") {
            if (silent) {
                return IGNORE_NODE;
            }
            throw new XMLTransformerError(`expected result to have required prop "${prop}" when finalized`);
        }
    }
    return input;
};
export const noEmptyString = (fn) => (content) => {
    if (!content.length) {
        throw new XMLTransformerError("Unexpected empty text node");
    }
    return fn(content);
};
export const intElementTransformer = createXMLTransformer({})(useResult(requireProps(false, "value")), {
    text: (result) => noEmptyString((content) => {
        const int = parseInt(content, 10);
        if (isNaN(int)) {
            throw new XMLTransformerError(`cannot parse text "${content}" to integer`);
        }
        result.value = int;
    }),
});
export const createMasterTransformer = (onItem, onError) => createXMLTransformer({
    main_release: intElementTransformer,
    images: ignoreNodeTransformer,
})(() => () => {
    const result = {};
    onItem(result);
}, {
    onError,
});
/*
type ChildNodeProcessors = Readonly<{ [name: string]: ProcessorFactory }>;

type ProcessorFactory = () => Processor<any>;
type FactoryForChildOf<T extends Processor<any>> = T extends {
  childProcessors: Readonly<{ [name: string]: infer P }>;
}
  ? P
  : never;
type ProcessorForChildOf<T extends Processor<any>> = T extends {
  childProcessors: Readonly<{ [name: string]: () => infer R }>;
}
  ? R
  : never;

abstract class Processor<TName extends string> {
  public abstract readonly childProcessors: ChildNodeProcessors;
  public processorInstanceCache: Map<
    ProcessorFactory,
    Processor<any>
  > = new Map();
  public properties: { [key: string]: any } = {};
  private currentChild: Processor<any> | null = null;
  public attributes: XMLAttributes = {};

  constructor(public readonly name: TName) {
    console.log(`::new() ${this.constructor.name}`);
  }

  public populate(name: string, attributes: XMLAttributes) {
    const self = this as any;
    self.properties = {};
    self.name = name;
    self.attributes = attributes;
  }

  public startElement(name: string, attributes: XMLAttributes): void {
    if (this.currentChild) {
      return this.currentChild.startElement(name, attributes);
    }

    const withErrorPrefix = getMessagePrefixer(
      `Cannot start node with name "${name}": `
    );
    const childProcessorFactory = this.childProcessors[name] as
      | FactoryForChildOf<this>
      | undefined;
    if (!childProcessorFactory) {
      throw withErrorPrefix(new Error("unexpected node name"));
    }

    const cachedInstance = this.processorInstanceCache.get(
      childProcessorFactory
    ) as ProcessorForChildOf<this>;
    if (cachedInstance) {
      cachedInstance.populate(name, attributes);
      this.currentChild = cachedInstance;
    } else {
      this.currentChild = childProcessorFactory() as ProcessorForChildOf<this>;
      this.currentChild.attributes = attributes;
      this.processorInstanceCache.set(childProcessorFactory, this.currentChild);
    }
  }

  public endElement(name: string) {
    if (!this.currentChild) {
      throw new Error("Unexpected endElement without child element");
    }

    if (this.currentChild.isProcessingChild) {
      this.currentChild.endElement(name);
    } else {
      const child = this.currentChild;
      this.currentChild = null;
      this.closeChild(child as ProcessorForChildOf<this>);
    }
  }

  public abstract closeChild(child: ProcessorForChildOf<this>): void;

  public text(text: string) {
    if (!this.currentChild) {
      if (text.trim().length) {
        throw this.withParseErrorPrefix(
          new Error(`Unexpected text node "${text}"`)
        );
      }
      return;
    }
    this.currentChild.text(text);
  }

  public get isProcessingChild() {
    return this.currentChild !== null;
  }

  protected withParseErrorPrefix = getMessagePrefixer(
    `Cannot parse node <${this.name}>: `
  );
}

class LeafNodeProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {} as const;

  public closeChild(child: never) {
    throw this.withParseErrorPrefix(new Error("Unexpected closeChild()"));
  }
}

// class ImageNodeProcessor<TName extends string> extends LeafNodeProcessor<
//   TName
// > {
//   public get imageProps() {
//     if (!this.attributes.uri) {
//       throw this.withParseErrorPrefix(new Error("Missing URI on image"));
//     }
//     const width = parseInt(this.attributes.width, 10);
//     if (isNaN(width)) {
//       throw this.withParseErrorPrefix(
//         new Error(
//           `Could not parse width attribute "${this.attributes.width}" to number`
//         )
//       );
//     }
//     const height = parseInt(this.attributes.height, 10);
//     if (isNaN(height)) {
//       throw this.withParseErrorPrefix(
//         new Error(
//           `Could not parse width attribute "${this.attributes.height}" to number`
//         )
//       );
//     }
//
//     return {
//       uri: this.attributes.uri as string,
//       width,
//       height,
//     };
//   }
// }

class StringPropNodeProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {} as const;
  public value?: string;

  constructor(name: TName, public nonEmpty = false) {
    super(name);
  }

  public text(text: string) {
    if (this.nonEmpty && !text.trim().length) {
      throw this.withParseErrorPrefix(new Error("Unexpected empty text node"));
    }
    this.value = text;
  }

  public closeChild(child: never) {
    throw this.withParseErrorPrefix(new Error("Unexpected closeChild()"));
  }
}

class NameNodeProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {} as const;
  public value?: {
    originalName: string;
    nameIndex: number;
    name: string;
  };

  constructor(name: TName, public nonEmpty = false) {
    super(name);
  }

  public text(text: string) {
    if (this.nonEmpty && !text.trim().length) {
      throw this.withParseErrorPrefix(new Error("Unexpected empty text node"));
    }

    const indexedNameMatch = text.match(/^([\s\S]+?)(?:\s?\((\d{1,3})\))?$/);
    if (!indexedNameMatch) {
      throw this.withParseErrorPrefix(
        new Error(`text "${indexedNameMatch}" did not match regex pattern`)
      );
    }
    this.value = {
      originalName: text,
      name: text[1],
      nameIndex: indexedNameMatch[2] ? parseInt(indexedNameMatch[2], 10) : 1,
    };
  }

  public closeChild(child: never) {
    throw this.withParseErrorPrefix(new Error("Unexpected closeChild()"));
  }
}

class IntPropNodeProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {} as const;
  public value?: number;

  constructor(name: TName, public nonEmpty = false) {
    super(name);
  }

  public text(text: string) {
    if (!text.length) {
      if (this.nonEmpty) {
        throw this.withParseErrorPrefix(
          new Error("Unexpected empty text node")
        );
      }
      return;
    }

    const int = parseInt(text, 10);
    if (isNaN(int)) {
      throw this.withParseErrorPrefix(
        new Error(`cannot parse text "${text}" to integer`)
      );
    }

    this.value = int;
  }

  public closeChild(child: never) {
    throw this.withParseErrorPrefix(new Error("Unexpected closeChild()"));
  }
}

class ImagesNodeProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {
    image: () => new LeafNodeProcessor("image"),
  } as const;

  public closeChild(child: LeafNodeProcessor<"image">) {}
}

class ArtistNodeProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {
    id: () => new IntPropNodeProcessor("id", true),
    name: () => new NameNodeProcessor("name", true),
    anv: () => new NameNodeProcessor("anv", false),
    join: () => new StringPropNodeProcessor("join", false),
    role: () => new StringPropNodeProcessor("role", false),
  } as const;

  public closeChild(child: ProcessorForChildOf<ArtistNodeProcessor<TName>>) {
    if (child.nonEmpty) {
      if (!child.value) {
        throw this.withParseErrorPrefix(
          new Error(`missing "${child.name}" child value`)
        );
      }
    }

    if (child.value) {
      switch (child.name) {
        case "id":
        case "join": {
          this.properties[child.name] = child.value;
          break;
        }
        case "anv":
        case "name": {
          this.properties.name = child.value.name;
          this.properties.originalName = child.value.originalName;
          this.properties.nameIndex = child.value.nameIndex;
          break;
        }
        default:
          throw this.withParseErrorPrefix(
            new Error(`closeChild with unknown name "${(child as any).name}"`)
          );
      }
    }
  }
}

class ArtistsNodeProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {
    artist: () => new ArtistNodeProcessor("artist"),
  } as const;

  public closeChild(child: ArtistNodeProcessor<"artist">) {
    const { artists = [] } = this.properties;
    artists.push(child.properties);
    this.properties.artists = artists;
  }
}

class MasterProcessor<TName extends string> extends Processor<TName> {
  public childProcessors = {
    main_release: () => new IntPropNodeProcessor("main_release"),
    images: () => new ImagesNodeProcessor("images"),
    artists: () => new ArtistsNodeProcessor("artists"),
  } as const;

  public closeChild(child: ProcessorForChildOf<MasterProcessor<TName>>) {
    switch (child.name) {
      case "main_release":
        this.properties.mainRelease = child.value;
        break;
      case "artists":
        this.properties.artists = child.properties.artists;
        break;
      case "images":
        // ignore
        break;
      default:
        throw this.withParseErrorPrefix(
          new Error(`closeChild with unknown name "${(child as any).name}"`)
        );
    }
  }
}

}*/
